'use client';

import { useOrder } from '@/hooks/use-order';
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePreorder } from '@/hooks/use-preorder';
import { useItem } from '@/hooks/use-item';

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
    const { preordersSuccess, removePreorder } = usePreorder();
    const { items: allItems } = useItem();

    const syncOptions = {
        refetchInterval: 1000 * 30,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 10,
        ...options
    };

    const { data: orders, isLoading: isOrdersLoading, isFetching: isOrdersFetching } = useMyOrders(syncOptions);
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

    const preorderNotifs = useMemo(() => {
        console.log("preorderNotifs calc starting, preordersSuccess:", preordersSuccess, "allItems:", allItems);
        if (!allItems || allItems.length === 0) return [];
        
        const list: any[] = [];
        
        preordersSuccess.forEach(pre => {
            const stall = allItems.find(s => Number(s.id) === Number(pre.stallId));
            if (!stall) return;
            const item = stall.items.find(i => Number(i.id) === Number(pre.itemId));
            if (!item) return;
            
            let currentStock = 0;
            if (pre.variationId) {
                const variation = item.variations?.find(v => Number(v.id) === Number(pre.variationId));
                currentStock = variation ? (Number(variation.stock) || Number((variation as any).stocks) || 0) : 0;
            } else {
                currentStock = Number(item.stocks) || 0;
            }
            
            const displayStock = currentStock > 0 ? currentStock : 5;
            const nameWithVar = pre.variationName ? `${pre.itemName} (${pre.variationName})` : pre.itemName;
            const notifId = `preorder-${pre.id}-${pre.itemId}-${pre.variationId || 'none'}-restocked`;
            
            list.push({
                id: notifId,
                type: 'preorder',
                title: 'Item Restocked!',
                message: `Great news! "${nameWithVar}" from ${pre.stallName} has been restocked (Stocks: ${displayStock}). Click here to see details!`,
                time: pre.createdAt,
                link: `/stall/item/show?id=${pre.itemId}`,
                status: 'RESTOCKED'
            });
        });
        
        return list;
    }, [allItems, preordersSuccess]);

    const notifications = useMemo(() => {
        const orderNotifs = orders
            ? orders
                .filter(o => NOTIF_STATUSES.includes(o.status.toUpperCase()))
                .map(o => {
                    const { title, message } = getNotifContent(o.status, o.stallName, o.cancelledBy);
                    return {
                        id: `order-${o.id}-${o.status}`,
                        type: 'order',
                        title,
                        message,
                        time: o.createdAt,
                        link: `/orders/${o.id}/track`,
                        status: o.status
                    };
                })
            : [];

        return [...orderNotifs, ...preorderNotifs]
            .filter(n => !dismissedIds.includes(n.id))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    }, [orders, preorderNotifs, dismissedIds]);

    const clearAll = () => {
        const orderIds = orders?.filter(o => NOTIF_STATUSES.includes(o.status.toUpperCase()))
            .map(o => `order-${o.id}-${o.status}`) || [];
            
        const preorderIds = preordersSuccess.map(pre => `preorder-${pre.id}-${pre.itemId}-${pre.variationId || 'none'}-restocked`);
            
        const allIds = Array.from(new Set([...dismissedIds, ...orderIds, ...preorderIds]));
        
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
        queryClient.setQueryData(['dismissed_notifications'], allIds);
    };

    return {
        notifications,
        isLoading: isOrdersLoading,
        isFetching: isOrdersFetching,
        dismissNotification,
        clearAll,
        count: notifications.length
    };
}
