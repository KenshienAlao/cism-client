'use client';

import { useOrder } from '@/hooks/use-order';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const DISMISSED_KEY = 'cism_dismissed_notifications';

const NOTIF_STATUSES = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

function getNotifContent(status: string, stallName: string, cancelledBy?: string) {
    switch (status.toUpperCase()) {
        case 'READY':
            return {
                title: 'Order Ready!',
                message: `Your order from ${stallName} is ready for pickup!`,
            };
        case 'COMPLETED':
            return {
                title: 'Order Completed',
                message: `Your order from ${stallName} has been completed!`,
            };
        case 'CANCELLED':
            return {
                title: 'Order Cancelled',
                message: cancelledBy === 'CUSTOMER' 
                    ? `You have cancelled your order from ${stallName}.`
                    : `Your order from ${stallName} has been rejected by the stall.`,
            };
        case 'PREPARING':
            return {
                title: 'Order Being Prepared',
                message: `Your order from ${stallName} is now being prepared.`,
            };
        default:
            return {
                title: 'Order Update',
                message: `Your order from ${stallName} is currently ${status.toLowerCase()}.`,
            };
    }
}

export function useNotifications(options?: { refetchInterval?: number | false; staleTime?: number }) {
    const { useMyOrders } = useOrder();

    const syncOptions = {
        refetchInterval: 1000 * 30,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 10,
        ...options
    };

    const { data: orders, isLoading, isFetching } = useMyOrders(syncOptions);
    const queryClient = useQueryClient();

    const { data: dismissedIds = [] } = useQuery<string[]>({
        queryKey: ['dismissed_notifications'],
        queryFn: () => {
            const stored = localStorage.getItem(DISMISSED_KEY);
            return stored ? JSON.parse(stored) : [];
        },
        staleTime: Infinity,
    });

    const dismissNotification = (id: string) => {
        const next = [...dismissedIds, id];
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
        queryClient.setQueryData(['dismissed_notifications'], next);
    };

    const clearAll = () => {
        const allIds = [
            ...(orders?.filter(o => NOTIF_STATUSES.includes(o.status.toUpperCase()))
                .map(o => `order-${o.id}-${o.status}`) || [])
        ];
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
        queryClient.setQueryData(['dismissed_notifications'], allIds);
    };

    const notifications = useMemo(() => {
        if (!orders) return [];
        return orders
            .filter(o => NOTIF_STATUSES.includes(o.status.toUpperCase()))
            .map(o => {
                const { title, message } = getNotifContent(o.status, o.stallName, o.cancelledBy);
                return {
                    id: `order-${o.id}-${o.status}`,
                    type: 'ORDER',
                    title,
                    message,
                    time: o.createdAt,
                    link: `/orders/${o.id}/track`,
                    status: o.status
                };
            })
            .filter(n => !dismissedIds.includes(n.id));
    }, [orders, dismissedIds]);

    return {
        notifications,
        isLoading,
        isFetching,
        dismissNotification,
        clearAll,
        count: notifications.length
    };
}
