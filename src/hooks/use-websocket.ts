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
        queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY, (prev) => {
            if (!prev) return prev;
            return prev.map(o => o.id === order.id ? { ...o, ...order } : o);
        });

        queryClient.setQueryData<Order[]>(['stall-orders'], (prev) => {
            if (!prev) return prev;
            return prev.map(o => o.id === order.id ? { ...o, ...order } : o);
        });
        queryClient.setQueryData([...MY_ORDERS_QUERY_KEY, order.id], (prev: any) => {
            if (!prev) return prev;
            return { ...prev, ...order };
        });
        queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ['stall-orders'] });
        queryClient.invalidateQueries({ queryKey: [...MY_ORDERS_QUERY_KEY, order.id] });
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    }, [queryClient]);

    const getToastMessage = useCallback((order: any): string => {
        const status = order.status?.toUpperCase();
        const config = STATUS[status];
        const name = order.stallName || order.receipt;

        switch (status) {
            case 'PENDING':
                return `New order from ${name} received`;
            case 'PREPARING':
                return `${name} is now preparing your order`;
            case 'READY':
                return `🎉 Your order from ${name} is ready for pickup!`;
            case 'COMPLETED':
                return `Order from ${name} completed`;
            case 'CANCELLED':
                return `Order from ${name} has been cancelled`;
            default:
                return config?.description || `Order ${order.receipt} updated`;
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
            reconnectDelay: 0,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => { },
            onConnect: () => {
                reconnectAttempts.current = 0;
                client.subscribe('/user/queue/orders', (message) => {
                    const order = JSON.parse(message.body);
                    const mutationKey = `order-${order.id}-${order.status}`;
                    patchOrderInCache(order);
                    if (pendingMutations.has(mutationKey)) {
                        pendingMutations.delete(mutationKey);
                        return;
                    }

                    notifSuccess(getToastMessage(order));
                });

                client.subscribe('/topic/inventory', (message) => {
                    queryClient.invalidateQueries({ queryKey: ITEM_QUERY_KEY });
                });

                // Presence tracking
                client.subscribe('/topic/presence', (message) => {
                    const presence = JSON.parse(message.body);
                    // Update user/stall presence in cache
                    queryClient.setQueryData(['presence', presence.id, presence.userType], presence);
                });

                client.subscribe('/user/queue/chat', (message) => {
                    const chat = JSON.parse(message.body);

                    if (chat.type === 'READ_RECEIPT') {
                      const baseKey = [...CHAT_QUERY_KEY, Number(chat.stallId), Number(chat.customerId)];
                        queryClient.setQueriesData<any[]>({ queryKey: baseKey }, (prev) => {
                            if (!prev) return prev;
                            return prev.map(msg => {
                                if (chat.sentByStall) {
                                    // Stall read the messages → mark messages sent by customer as read
                                    return msg.sentByStall === false ? { ...msg, readByStall: true } : msg;
                                } else {
                                    // Customer read the messages → mark messages sent by stall as read
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

                    // New message received via WebSocket
                    const baseKey = [...CHAT_QUERY_KEY, Number(chat.stallId), Number(chat.customerId)];
                    queryClient.setQueriesData<any[]>({ queryKey: baseKey }, (prev) => {
                        if (!prev) return [chat];
                        const alreadyExists = prev.some(m => m.id === chat.id);
                        if (alreadyExists) return prev;
                        const hasOptimistic = prev.some(m => m.status === 'sending' && m.content === chat.content);
                        if (hasOptimistic) {
                            return prev.map(m => 
                                (m.status === 'sending' && m.content === chat.content) 
                                    ? { ...chat, status: 'sent' } 
                                    : m
                            );
                        }
                        return [...prev, chat];
                    });
                    // NOTE: No invalidateQueries here — it would trigger a refetch that overwrites
                    // in-memory read state (readByStall/readByCustomer) with potentially stale DB data.

                    // Update thread list directly in cache instead of invalidating
                    queryClient.setQueryData<any[]>([...CHAT_QUERY_KEY, 'threads', profileId], (prev) => {
                        if (!prev) return prev;
                        const threadIdx = prev.findIndex(
                            (t: any) => t.stallId === chat.stallId && t.customerId === chat.customerId
                        );
                        if (threadIdx >= 0) {
                            const updated = [...prev];
                            updated[threadIdx] = {
                                ...updated[threadIdx],
                                lastMessage: chat.content,
                                lastMessageAt: chat.createdAt,
                                isUnread: chat.sentByStall,
                            };
                            // Move to top
                            const [thread] = updated.splice(threadIdx, 1);
                            updated.unshift(thread);
                            return updated;
                        }
                        // New thread — add to top
                        return [{
                            stallId: chat.stallId,
                            stallName: chat.senderName,
                            stallImage: null,
                            customerId: chat.customerId,
                            customerName: chat.customerName,
                            customerImage: null,
                            lastMessage: chat.content,
                            lastMessageAt: chat.createdAt,
                            isUnread: profileId !== chat.senderId,
                        }, ...prev];
                    });

                    // Toast only for messages from others
                    if (chat.sentByStall) {
                        notifSuccess(`New message from ${chat.senderName}`);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('WS STOMP Error:', frame.headers['message']);
            },
            onWebSocketClose: () => {
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    reconnectAttempts.current++;
                    setTimeout(() => {
                        if (clientRef.current && !clientRef.current.connected) {
                            clientRef.current.activate();
                        }
                    }, delay);
                }
            },
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
