'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/use-order';
import { useItem } from '@/hooks/use-item';
import { ReviewModal } from '@/components/reviewmodal';
import { OrderTracking } from '@/components/ordertracking';
import Loading from '@/components/ui/loading';
import { useState } from 'react';
import { Receipt } from 'lucide-react';

export default function TrackOrderPage() {
    const params = useParams();
    const router = useRouter();
    const { useTrackOrder, receiveOrder } = useOrder();
    const { createReview } = useItem();

    const orderId = params.id as string || null;
    const { data: order, isLoading } = useTrackOrder(orderId);

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleReviewSubmit = async (data: { rating: number; comment: string; imageFile?: File }) => {
        if (!order) return;

        setIsSubmittingReview(true);
        try {
            for (const item of order.orderItems) {
                await createReview({
                    itemId: item.itemId || item.id,
                    stallId: order.stallId,
                    star: data.rating,
                    comment: data.comment,
                    image: data.imageFile
                });
            }
            setIsReviewOpen(false);
            router.push('/orders');
        } catch (error) {
            console.error("Failed to submit reviews", error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) return <Loading />;

    if (!order) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white border border-neutral-100 flex items-center justify-center mb-6 rounded-md">
                    <Receipt className="w-8 h-8 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Order Not Found</h1>
                <p className="text-neutral-400 text-xs font-medium max-w-[200px] mt-2 mb-8 leading-relaxed">
                    We couldn't find the tracking information for this order.
                </p>
                <button
                    onClick={() => router.push('/orders')}
                    className="px-10 py-4 bg-orange-500 text-white rounded-md font-bold text-xs uppercase tracking-widest active:bg-orange-600 transition-colors"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <>
            <OrderTracking
                order={order}
                onBack={() => router.back()}
                onReview={() => setIsReviewOpen(true)}
                onReceive={() => receiveOrder.mutate(order.id)}
                isProcessing={receiveOrder.isPending}
            />

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                orderId={order.orderCode}
                onSubmitReview={handleReviewSubmit}
                isSubmitting={isSubmittingReview}
            />
        </>
    );
}
