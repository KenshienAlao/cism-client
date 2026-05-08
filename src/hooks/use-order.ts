import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/service/order.service';
import { Order, OrderRequest } from '@/model/order.model';
import { notifError, notifSuccess } from '@/lib/toast';
import { useState } from 'react';
import { useAuth } from './use-auth';
import { useConfirmation } from '@/context/confirmation.context';
import { trackMutation, clearMutation } from './use-websocket';

export const MY_ORDERS_QUERY_KEY = ['orders'];

export function useOrder() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    const { showConfirmation } = useConfirmation();

    const addOrder = useMutation({
        mutationFn: (request: OrderRequest) => orderService.addOrder(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            // notifSuccess('Order placed successfully!');
        },
        onError: (error: any) => {
            notifError(error.response?.data?.message || 'Failed to place order');
        }
    });

    const cancelOrder = useMutation({
        mutationFn: (orderId: number) => orderService.cancelOrder(orderId),
        onMutate: async (orderId) => {
            trackMutation(`order-${orderId}-CANCELLED`);

            await queryClient.cancelQueries({ queryKey: MY_ORDERS_QUERY_KEY });
            const previousOrders = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY);
            if (previousOrders) {
                queryClient.setQueryData<Order[]>(MY_ORDERS_QUERY_KEY,
                    previousOrders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o)
                );
            }
            return { previousOrders };
        },
        onSuccess: (_, orderId) => {
            const stallName = queryClient.getQueryData<Order[]>(MY_ORDERS_QUERY_KEY)
                ?.find(o => o.id === orderId)?.stallName;
            // notifSuccess(stallName ? `Order from ${stallName} cancelled` : 'Order cancelled');
        },
        onError: (error: any, orderId, context) => {
            clearMutation(`order-${orderId}-CANCELLED`);
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
        mutationFn: (orderId: number) => orderService.deleteOrder(orderId),
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

    const useMyOrders = (options?: { refetchInterval?: number | false }) => useQuery({
        queryKey: MY_ORDERS_QUERY_KEY,
        queryFn: async () => {
            const response = await orderService.getMyOrders();
            return response.data || [];
        },
        enabled: !!profile,
        ...options
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
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

    const useTrackOrder = (orderId: number | null) => useQuery({
        queryKey: [...MY_ORDERS_QUERY_KEY, orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const response = await orderService.getOrderById(orderId);
            return response.data;
        },
        enabled: !!orderId,
        refetchInterval: (query) => {
            return query.state.data?.status?.toLowerCase() !== 'completed' ? 10000 : false;
        }
    });

    const handleCancelOrder = (orderId: number) => {
        showConfirmation({
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order? This action cannot be undone.",
            confirmText: "Yes, Cancel",
            type: "danger",
            onConfirm: () => {
                cancelOrder.mutate(orderId);
            }
        });
    };

    const handleDeleteOrder = (orderId: number) => {
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
        deleteOrder,
        useMyOrders,
        useTrackOrder,
        updateStatus,
        handleCancelOrder,
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

    const handlePlaceOrder = (items: any[]) => {
        addOrder.mutate({
            cartItemIds: items.map(item => item.id),
            deliveryMethod: deliveryMethod.toUpperCase() as 'DELIVERY' | 'PICKUP',
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
