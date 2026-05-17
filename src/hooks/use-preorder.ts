'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { preorderService, PreorderResponse } from '@/service/preorder.service';

export interface PreorderItem {
    id?: number;
    itemId: number;
    itemName: string;
    price: number;
    variationId: number | null;
    variationName: string | null;
    stallId: number;
    stallName: string;
    initialStock: number;
    quantity: number;
    createdAt: string;
}

export function usePreorder() {
    const queryClient = useQueryClient();

    const { data: preorders = [] } = useQuery<PreorderItem[]>({
        queryKey: ['preorders'],
        queryFn: async () => {
            try {
                const res = await preorderService.getPreorders();
                if (res.success && res.data) {
                    return res.data;
                }
                return [];
            } catch (err) {
                console.error("Failed to load preorders from database", err);
                return [];
            }
        },
        staleTime: 1000 * 5,
        refetchInterval: 1000 * 10,
        refetchOnWindowFocus: true,
    });

    const { data: preordersSuccess = [] } = useQuery<PreorderItem[]>({
        queryKey: ['preorders-success'],
        queryFn: async () => {
            try {
                const res = await preorderService.getPreordersSuccess();
                if (res.success && res.data) {
                    return res.data;
                }
                return [];
            } catch (err) {
                console.error("Failed to load preordersSuccess from database", err);
                return [];
            }
        },
        staleTime: 1000 * 5,
        refetchInterval: 1000 * 10,
        refetchOnWindowFocus: true,
    });

    const addPreorder = async (item: Omit<PreorderItem, 'createdAt' | 'id'>) => {
        try {
            const res = await preorderService.addPreorder({
                itemId: item.itemId,
                variationId: item.variationId,
                quantity: item.quantity
            });
            if (res.success && res.data) {
                queryClient.setQueryData<PreorderItem[]>(['preorders'], (old = []) => {
                    return [...old.filter(p => !(p.itemId === item.itemId && p.variationId === item.variationId)), res.data as PreorderItem];
                });
                queryClient.invalidateQueries({ queryKey: ['preorders'] });
                queryClient.invalidateQueries({ queryKey: ['preorders-success'] });
                queryClient.invalidateQueries({ queryKey: ['dismissed_notifications'] });
            }
        } catch (err) {
            console.error("Failed to add preorder to DB", err);
        }
    };

    const removePreorder = async (itemId: number, variationId: number | null = null) => {
        try {
            // Optimistic update
            queryClient.setQueryData<PreorderItem[]>(['preorders'], (old = []) => {
                return old.filter(p => !(p.itemId === itemId && p.variationId === variationId));
            });
            queryClient.setQueryData<PreorderItem[]>(['preorders-success'], (old = []) => {
                return old.filter(p => !(p.itemId === itemId && p.variationId === variationId));
            });
            await preorderService.deletePreorder(itemId, variationId);
            queryClient.invalidateQueries({ queryKey: ['preorders'] });
            queryClient.invalidateQueries({ queryKey: ['preorders-success'] });
        } catch (err) {
            console.error("Failed to remove preorder from DB", err);
        }
    };

    const isPreordered = (itemId: number, variationId: number | null = null) => {
        return preorders.some(
            (p) => p.itemId === itemId && p.variationId === variationId
        );
    };

    return {
        preorders,
        preordersSuccess,
        addPreorder,
        removePreorder,
        isPreordered,
    };
}
