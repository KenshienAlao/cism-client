'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { CART_QUERY_KEY } from './use-cart';
import { MY_ORDERS_QUERY_KEY } from './use-order';
import { ITEM_QUERY_KEY } from './use-item';
import { CHAT_QUERY_KEY } from './use-chat';
import { STATUS } from '@/config/track.config';
import { Order } from '@/model/order.model';
import { notifSuccess } from '@/lib/toast';

const getWsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    return `${baseUrl}/ws`;
};

const WS_URL = getWsUrl();

const pendingMutations = new Set<string>();

export function trackMutation(key: string) {
    pendingMutations.add(key);
    // Auto-clear after 5s (safety net)
    setTimeout(() => pendingMutations.delete(key), 5000);
}

export function clearMutation(key: string) {
    pendingMutations.delete(key);
}

export function useWebSocket() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const clientRef = useRef<Client | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 10;

    const profileId = profile?.user?.id;

    const patchOrderInCache = useCallback((order: any) => {
        const updateList = (prev: Order[] | undefined) => {
            if (!prev) return prev;
            const exists = prev.some(o => o.id === order.id);
            if (!exists) return [order, ...prev];
            return prev.map(o => o.id === order.id ? { ...o, ...order } : o);
        };

        queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY, updateList);
        queryClient.setQueryData<Order[]>(['stall-orders'], updateList);
        queryClient.setQueryData([...MY_ORDERS_QUERY_KEY, order.id], (prev: any) =>
            prev ? { ...prev, ...order } : order
        );

        // Only invalidate cart if order status changed to COMPLETED or CANCELLED to sync stock/cart
        if (['COMPLETED', 'CANCELLED'].includes(order.status?.toUpperCase())) {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        }
    }, [queryClient]);

    const getToastMessage = useCallback((order: any): string => {
        const status = order.status?.toUpperCase();
        const config = STATUS[status];
        const name = order.stallName || order.orderCode;

        switch (status) {
            case 'PENDING':
                return `New order from ${name} received`;
            case 'PREPARING':
                return `${name} is now preparing your order`;
            case 'READY':
                return `Your order from ${name} is ready for pickup!`;
            case 'COMPLETED':
                return `Order from ${name} completed`;
            case 'CANCELLED':
                return `Order from ${name} has been cancelled`;
            default:
                return config?.description || `Order ${order.orderCode} updated`;
        }
    }, []);

    useEffect(() => {
        if (!profileId) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            return;
        }

        if (clientRef.current) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${WS_URL}?appType=client`),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => { },
            onConnect: () => {
                reconnectAttempts.current = 0;

                // Orders Subscription
                client.subscribe('/user/queue/orders', (message) => {
                    const event = JSON.parse(message.body);
                    const { data: order } = event;
                    const mutationKey = `order-${order.id}-${order.status}`;

                    patchOrderInCache(order);

                    if (pendingMutations.has(mutationKey)) {
                        pendingMutations.delete(mutationKey);
                        return;
                    }

                    notifSuccess(getToastMessage(order));
                });

                // Inventory Subscription
                client.subscribe('/topic/inventory', () => {
                    queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEY });
                });

                // Presence Subscription
                client.subscribe('/topic/presence', (message) => {
                    const presence = JSON.parse(message.body);
                    queryClient.setQueryData(['presence', presence.id, presence.userType], presence);
                });

                // Chat Subscription
                client.subscribe('/user/queue/chat', (message) => {
                    const chat = JSON.parse(message.body);

                    if (chat.type === 'READ_RECEIPT') {
                        const baseKey = [...CHAT_QUERY_KEY, Number(chat.stallId), Number(chat.customerId)];
                        queryClient.setQueriesData<any[]>({ queryKey: baseKey }, (prev) => {
                            if (!prev) return prev;
                            return prev.map(msg => {
                                if (chat.sentByStall) {
                                    return msg.sentByStall === false ? { ...msg, readByStall: true } : msg;
                                } else {
                                    return msg.sentByStall === true ? { ...msg, readByCustomer: true } : msg;
                                }
                            });
                        });
                        return;
                    }

                    if (chat.type === 'MESSAGE_DELETED') {
                        const baseKey = [...CHAT_QUERY_KEY, chat.stallId, chat.customerId];
                        queryClient.setQueriesData<any[]>({ queryKey: baseKey }, (prev) => {
                            if (!prev) return prev;
                            return prev.map(msg =>
                                msg.id === chat.messageId
                                    ? { ...msg, content: 'Message has been removed', isDeleted: true }
                                    : msg
                            );
                        });
                        return;
                    }

                    // message logic
                    const chatListKey = [...CHAT_QUERY_KEY, Number(chat.stallId), Number(chat.customerId)];
                    queryClient.setQueryData<any[]>(chatListKey, (prev) => {
                        if (!prev) return [chat];
                        if (prev.some(m => m.id === chat.id)) return prev;

                        const optimisticIdx = prev.findIndex(m => m.status === 'sending' && m.content === chat.content);
                        if (optimisticIdx !== -1) {
                            const updated = [...prev];
                            updated[optimisticIdx] = { ...chat, status: 'sent' };
                            return updated;
                        }
                        return [...prev, chat];
                    });

                    // Thread list update
                    const threadListKey = [...CHAT_QUERY_KEY, 'threads', profileId];
                    queryClient.setQueryData<any[]>(threadListKey, (prev) => {
                        if (!prev) return prev;
                        const updated = [...prev];
                        const threadIdx = updated.findIndex(
                            (t: any) => t.stallId === chat.stallId && t.customerId === chat.customerId
                        );

                        const threadData = {
                            stallId: chat.stallId,
                            stallName: chat.senderName,
                            stallImage: null,
                            customerId: chat.customerId,
                            customerName: chat.customerName,
                            customerImage: null,
                            lastMessage: chat.content,
                            lastMessageAt: chat.createdAt,
                            isUnread: chat.sentByStall,
                        };

                        if (threadIdx >= 0) {
                            updated[threadIdx] = { ...updated[threadIdx], ...threadData };
                            const [thread] = updated.splice(threadIdx, 1);
                            updated.unshift(thread);
                        } else {
                            updated.unshift(threadData);
                        }
                        return updated;
                    });

                    if (chat.sentByStall) {
                        notifSuccess(`New message from ${chat.senderName}`);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('WS STOMP Error:', frame.headers['message']);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [profileId, queryClient, patchOrderInCache, getToastMessage]);

    return clientRef.current;
}
