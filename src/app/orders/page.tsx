'use client';

import { useOrder } from '@/hooks/use-order';
import { useItem } from '@/hooks/use-item';
import { useAuth } from '@/hooks/use-auth';
import { ReviewModal } from '@/components/reviewmodal';
import { useState, useMemo, useEffect, useRef } from 'react';
import { OrderCard } from '@/components/orders/order-card';
import { EmptyOrders } from '@/components/orders/empty-orders';
import Tabs from '@/components/orders/tabs';
import Emptytab from '@/components/orders/empty-tab';
import { CancelReasonModal } from '@/components/orders/cancel-reason-modal';
import { OrdersPageSkeleton } from '@/components/orders/orders-skeleton';
import { MY_ORDERS_QUERY_KEY } from '@/hooks/use-order';
import { useQueryClient } from '@tanstack/react-query';
import { notifSuccess, notifError } from '@/lib/toast';
import { AnimatePresence, motion } from 'framer-motion';

const TABS = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
type TabType = typeof TABS[number];

const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
    exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export default function OrdersPage() {
    const { isLoading: isAuthLoading } = useAuth();
    const { useMyOrders, receiveOrder, deleteOrder, cancelOrder, handleDeleteOrder } = useOrder();
    const { createReview } = useItem();
    const queryClient = useQueryClient();
    const { data: orders, isLoading } = useMyOrders({ 
        refetchInterval: 30000,
        staleTime: 1000 * 60, 
    });

    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
    const prevOrderIdsRef = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);
    const hasAutoSwitchedRef = useRef(false);

    useEffect(() => {
        if (!orders) return;
        const currentIds = new Set(orders.map((o: any) => o.id));

        if (isFirstLoad.current) {
            prevOrderIdsRef.current = currentIds;
            isFirstLoad.current = false;
            return;
        }

        const arrived = [...currentIds].filter(id => !prevOrderIdsRef.current.has(id));
        if (arrived.length > 0) {
            setNewOrderIds(prev => { const n = new Set(prev); arrived.forEach(id => n.add(id)); return n; });
            setTimeout(() => {
                setNewOrderIds(prev => { const n = new Set(prev); arrived.forEach(id => n.delete(id)); return n; });
            }, 3000);
        }

        prevOrderIdsRef.current = currentIds;
    }, [orders]);

    useEffect(() => {
        if (!orders || hasAutoSwitchedRef.current) return;
        hasAutoSwitchedRef.current = true;
        const hasPending = orders.some((o: any) => o.status.toUpperCase() === 'PENDING');
        if (!hasPending) {
            const first = TABS.find(tab =>
                tab !== 'COMPLETED' && tab !== 'CANCELLED' &&
                orders.some((o: any) => o.status.toUpperCase() === tab)
            );
            if (first) setActiveTab(first);
        }
    }, [orders]);

    const filteredOrders = useMemo(() =>
        (orders ?? []).filter((o: any) => o.status.toUpperCase() === activeTab)
    , [orders, activeTab]);

    const handleReviewSubmit = async (data: { rating: number; comment: string; imageFile?: File }) => {
        if (!selectedOrder) return;
        setIsSubmittingReview(true);

        const prevOrders = queryClient.getQueryData<any[]>(MY_ORDERS_QUERY_KEY);
        queryClient.setQueryData<any[]>(MY_ORDERS_QUERY_KEY, old =>
            old?.filter(o => o.id !== selectedOrder.id) ?? []
        );
        setSelectedOrder(null);

        try {
            const results = await Promise.all(selectedOrder.orderItems.map((item: any) =>
                createReview({
                    itemId: item.itemId || item.id,
                    stallId: selectedOrder.stallId,
                    star: data.rating,
                    comment: data.comment,
                    image: data.imageFile
                })
            ));

            const hasSuccess = results.some(res => res.success);
            const allAlreadyExist = results.every(res => !res.success && res.message?.toLowerCase().includes('already'));

            await deleteOrder.mutateAsync(selectedOrder.id);
            
            if (hasSuccess) {
                notifSuccess('Review submitted! Thank you.');
            } else if (!allAlreadyExist) {
            }
        } catch (error) {
            if (prevOrders) queryClient.setQueryData(MY_ORDERS_QUERY_KEY, prevOrders);
            setSelectedOrder(selectedOrder);
            notifError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleConfirmCancel = async (reason: string) => {
        if (!orderToCancel) return;
        try {
            await cancelOrder.mutateAsync({ id: orderToCancel, reason });
            setOrderToCancel(null);
        } catch (_) {}
    };

    if (isAuthLoading || (isLoading && !orders)) return <OrdersPageSkeleton />;
    if (!orders?.length) return <EmptyOrders />;


    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">

            {/* ── Sub-Header ── */}
            <header className="sticky top-0 z-30 bg-background border-b border-border">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
                    <div className="overflow-x-auto no-scrollbar py-1">
                        <Tabs
                            TABS={TABS}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            orders={orders}
                        />
                    </div>
                </div>
            </header>

            {/* ── Order List ── */}
            <main className="max-w-5xl mx-auto px-4 py-4 md:py-6">
                <AnimatePresence mode="wait">
                    {filteredOrders.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            variants={listVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, transition: { duration: 0.1 } }}
                            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1"
                        >
                            <AnimatePresence initial={false}>
                                {filteredOrders.map((order: any) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        whileHover={{ y: -1, transition: { duration: 0.1 } }}
                                        className={`rounded-lg border bg-card text-card-foreground p-1 transition-colors ${
                                            newOrderIds.has(order.id)
                                                ? 'border-orange-500 ring-1 ring-orange-500'
                                                : 'border-border'
                                        }`}
                                    >
                                        <OrderCard
                                            order={order}
                                            onCancel={() => setOrderToCancel(order.id)}
                                            onReceive={(id: string) => receiveOrder.mutate(id)}
                                            onDelete={handleDeleteOrder}
                                            onReview={setSelectedOrder}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`empty-${activeTab}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="border border-border rounded-lg bg-card text-card-foreground p-4"
                        >
                            <Emptytab activeTab={activeTab} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ── Functional Action Modals ── */}
            <ReviewModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                orderId={selectedOrder?.orderCode}
                onSubmitReview={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
            />

            <CancelReasonModal
                isOpen={!!orderToCancel}
                onClose={() => setOrderToCancel(null)}
                onConfirm={handleConfirmCancel}
                isPending={cancelOrder.isPending}
            />
        </div>
    );
}