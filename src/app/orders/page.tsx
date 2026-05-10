'use client';

import { useOrder } from '@/hooks/use-order';
import { useItem } from '@/hooks/use-item';
import { ReviewModal } from '@/components/reviewmodal';
import { ShoppingBag } from 'lucide-react';
import Loading from '@/components/ui/loading';
import { useState, useMemo } from 'react';
import { OrderCard } from '@/components/orders/order-card';
import { EmptyOrders } from '@/components/orders/empty-orders';
import Tabs from '@/components/orders/tabs';
import Emptytab from '@/components/orders/empty-tab';

const TABS = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
type TabType = typeof TABS[number];

import { CancelReasonModal } from '@/components/orders/cancel-reason-modal';

export default function OrdersPage() {
    const { useMyOrders, receiveOrder, deleteOrder, cancelOrder, handleDeleteOrder } = useOrder();
    const { createReview } = useItem();
    const { data: orders, isLoading } = useMyOrders();
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

    const filteredOrders = useMemo(() =>
        orders?.filter(o => o.status.toUpperCase() === activeTab) || []
        , [orders, activeTab]);

    if (isLoading || (!orders && !isLoading)) return <Loading />;
    if (!orders?.length) return <EmptyOrders />;

    const handleReviewSubmit = async (data: { rating: number; comment: string; imageFile?: File }) => {
        if (!selectedOrder) return;
        setIsSubmittingReview(true);
        try {
            await Promise.all(selectedOrder.orderItems.map((item: any) =>
                createReview({
                    itemId: item.itemId || item.id,
                    stallId: selectedOrder.stallId,
                    star: data.rating,
                    comment: data.comment,
                    image: data.imageFile
                })
            ));

            // After successful review, remove from client's view
            await deleteOrder.mutateAsync(selectedOrder.id);

            setSelectedOrder(null);
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleConfirmCancel = async (reason: string) => {
        if (!orderToCancel) return;
        try {
            await cancelOrder.mutateAsync({ id: orderToCancel, reason });
            setOrderToCancel(null);
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-32">
            <header className="sticky top-0 z-40">
                <Tabs
                    TABS={TABS}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    orders={orders}
                />
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onCancel={() => setOrderToCancel(order.id)}
                            onReceive={(id: string) => receiveOrder.mutate(id)}
                            onDelete={handleDeleteOrder}
                            onReview={setSelectedOrder}
                        />
                    ))
                ) : (
                    <Emptytab activeTab={activeTab} />
                )}
            </main>

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
