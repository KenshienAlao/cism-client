'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { CART_QUERY_KEY } from './use-cart';
import { MY_ORDERS_QUERY_KEY } from './use-order';
import { ITEM_QUERY_KEY } from './use-item';
import { STATUS } from '@/config/track.config';
import { Order } from '@/model/order.model';
import { notifSuccess } from '@/lib/toast';

const getWsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/$/, '');
    return `${baseUrl}/ws`;
};

const WS_URL = getWsUrl();

// Track mutations in progress so we can skip duplicate toasts
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
        if (!profile) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 0,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: () => {},
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
            },
            onStompError: (frame) => {
                console.error('WS STOMP Error:', frame.headers['message']);
            },
            onWebSocketClose: () => {
                // Exponential backoff reconnect
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
    }, [profile, queryClient, patchOrderInCache, getToastMessage]);

    return clientRef.current;
}
