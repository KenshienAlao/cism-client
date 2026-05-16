import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/service/order.service';
import { Order, OrderRequest } from '@/model/order.model';
import { notifError, notifSuccess } from '@/lib/toast';
import { useState } from 'react';
import { useAuth } from './use-auth';
import { useConfirmation } from '@/context/confirmation.context';
import { trackMutation, clearMutation } from './use-websocket';
import { CART_QUERY_KEY } from './use-cart';

export const MY_ORDERS_QUERY_KEY = ['orders'];

export function useOrder() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { showConfirmation } = useConfirmation();

    const addOrder = useMutation({
        mutationFn: (request: OrderRequest) => orderService.addOrder(request),
        onMutate: async () => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });

            // Snapshot previous data
            const previousCart = queryClient.getQueryData<any[]>(CART_QUERY_KEY);
            const previousOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);

            // Optimistically clear cart
            queryClient.setQueryData(CART_QUERY_KEY, []);

            return { previousCart, previousOrders };
        },
        onSuccess: (response) => {
            if (response.success) {
                // Keep the success response data in cache
                queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
                queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            }
        },
        onError: (error: any, _, context) => {
            if (context?.previousCart) queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
            if (context?.previousOrders) queryClient.setQueryData(MY_ORDERS_QUERY_KEY, context.previousOrders);
            notifError(error.response?.data?.message || 'Failed to place order');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
    });

    const cancelOrder = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason?: string }) => orderService.cancelOrder(id, reason),
        onMutate: async ({ id }) => {
            trackMutation(`order-${id}-CANCELLED`);

            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            const previousOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);
            if (previousOrders) {
                queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY,
                    previousOrders.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o)
                );
            }
            return { previousOrders };
        },
        onSuccess: (_, { id }) => {
            // Success handled by WS or settled
        },
        onError: (error: any, { id }, context) => {
            clearMutation(`order-${id}-CANCELLED`);
            if (context?.previousOrders) {
                queryClient.setQueryData(MY_ORDERS_QUERY_KEY, context.previousOrders);
            }
            notifError(error.response?.data?.message || 'Failed to cancel order');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
    });

    const deleteOrder = useMutation({
        mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
        onMutate: async (orderId) => {
            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            const previousOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);
            if (previousOrders) {
                queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY,
                    previousOrders.filter(o => o.id !== orderId)
                );
            }
            return { previousOrders };
        },
        onError: (error: any, __, context) => {
            if (context?.previousOrders) {
                queryClient.setQueryData(MY_ORDERS_QUERY_KEY, context.previousOrders);
            }
            notifError(error.response?.data?.message || 'Failed to delete order');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
    });

    const useMyOrders = (options?: { refetchInterval?: number | false; staleTime?: number }) => useQuery({
        queryKey: MY_ORDERS_QUERY_KEY,
        queryFn: async () => {
            const response = await orderService.getMyOrders();
            return response.data || [];
        },
        enabled: !!profile,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 60,
        ...options
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            orderService.updateOrderStatus(id, status),
        onMutate: async ({ id, status }) => {
            trackMutation(`order-${id}-${status.toUpperCase()}`);

            await queryClient.cancelQueries({ queryKey: ['stall-orders'] });
            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });

            const prevStallOrders = queryClient.getQueryData<Order[]>(['stall-orders']);
            const prevMyOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);

            if (prevStallOrders) {
                queryClient.setQueryData<Order[]>(['stall-orders'],
                    prevStallOrders.map(o => o.id === id ? { ...o, status } : o)
                );
            }
            if (prevMyOrders) {
                queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY,
                    prevMyOrders.map(o => o.id === id ? { ...o, status } : o)
                );
            }

            return { prevStallOrders, prevMyOrders };
        },
        onError: (error: any, { id, status }, context) => {
            clearMutation(`order-${id}-${status.toUpperCase()}`);
            if (context?.prevStallOrders) queryClient.setQueryData(['stall-orders'], context.prevStallOrders);
            if (context?.prevMyOrders) queryClient.setQueryData(MY_ORDERS_QUERY_KEY, context.prevMyOrders);
            notifError(error.response?.data?.message || 'Failed to update order status');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['stall-orders'] });
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
    });

    const receiveOrder = useMutation({
        mutationFn: (orderId: string) => orderService.receiveOrder(orderId),
        onMutate: async (orderId) => {
            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            const previousOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);
            if (previousOrders) {
                queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY,
                    previousOrders.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o)
                );
            }
            return { previousOrders };
        },
        onSuccess: () => {
            // notifSuccess('Order received!');
        },
        onError: (error: any, _, context) => {
            if (context?.previousOrders) {
                queryClient.setQueryData(MY_ORDERS_QUERY_KEY, context.previousOrders);
            }
            notifError(error.response?.data?.message || 'Failed to mark as received');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
        }
    });

    const useTrackOrder = (orderId: string | null, options?: { staleTime?: number; refetchInterval?: number | false }) => useQuery({
        queryKey: [...MY_ORDERS_QUERY_KEY, orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const response = await orderService.getOrderById(orderId);
            return response.data;
        },
        enabled: !!orderId,
        initialData: () => {
            if (!orderId) return undefined;
            return queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY)?.find(o => o.id === orderId);
        },
        refetchInterval: (query) => {
            if (options?.refetchInterval !== undefined) return options.refetchInterval;
            const status = query.state.data?.status?.toUpperCase();
            return (status !== 'COMPLETED' && status !== 'CANCELLED') ? 10000 : false;
        },
        refetchOnWindowFocus: true,
        ...options
    });

    const handleDeleteOrder = (orderId: string) => {
        showConfirmation({
            title: "Delete Order",
            message: "Are you sure you want to remove this order from your history? This action cannot be undone.",
            confirmText: "Yes, Delete",
            type: "danger",
            onConfirm: () => {
                deleteOrder.mutate(orderId);
            }
        });
    };

    const getFilteredOrders = (orders: Order[], activeTab: string) => {
        return orders.filter(o => o.status.toUpperCase() === activeTab);
    };

    return {
        addOrder,
        cancelOrder,
        receiveOrder,
        deleteOrder,
        useMyOrders,
        useTrackOrder,
        updateStatus,
        handleDeleteOrder,
        getFilteredOrders
    };
}

export function useCheckout() {
    const { addOrder } = useOrder();
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'deliver' | 'pickup'>('deliver');
    const [message, setMessage] = useState('');
    const [completedOrders, setCompletedOrders] = useState<Order[]>([]);

    const handlePlaceOrder = (items: any[], buyNowItem?: { stallId: number, itemId: number, variationId: number, quantity: number }) => {
        addOrder.mutate({
            cartItemIds: items.map(item => item.id),
            buyNowItem: buyNowItem ? {
                stallId: buyNowItem.stallId,
                itemId: buyNowItem.itemId,
                variationId: buyNowItem.variationId,
                quantity: buyNowItem.quantity
            } : undefined,
            deliveryMethod: deliveryMethod.toUpperCase() as 'DELIVER' | 'PICKUP',
            paymentMethod: 'CASH',
            note: message
        }, {
            onSuccess: (response) => {
                if (response.data) {
                    const data = Array.isArray(response.data) ? response.data : [response.data];
                    setCompletedOrders(data);
                    setIsReceiptOpen(true);
                }
            }
        });
    };

    return {
        deliveryMethod,
        setDeliveryMethod,
        message,
        setMessage,
        isReceiptOpen,
        setIsReceiptOpen,
        handlePlaceOrder,
        isPending: addOrder.isPending,
        completedOrders
    };
}
