'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt } from 'lucide-react';
import { useOrder } from '@/hooks/use-order';
import { useItem } from '@/hooks/use-item';
import { useAuth } from '@/hooks/use-auth';
import { ReviewModal } from '@/components/reviewmodal';
import { OrderTracking } from '@/components/ordertracking';
import Loading from '@/components/ui/loading';

const containerVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
};

export default function TrackOrderPage() {
    const params = useParams();
    const router = useRouter();
    const { profile, isLoading: isAuthLoading } = useAuth();
    const { useTrackOrder, receiveOrder } = useOrder();
    const { createReview } = useItem();

    const orderId = (params.id as string) || null;
    const { data: order, isLoading } = useTrackOrder(orderId, {
        staleTime: 1000 * 30,
    });

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

    if (isAuthLoading || (isLoading && !order)) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-orange-500/10 selection:text-orange-500">
            <AnimatePresence mode="wait">
                {!order ? (
                    <motion.main
                        key="not-found"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                        className="mx-auto max-w-sm px-4 pt-24 pb-12 flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center mb-3 rounded-md">
                            <Receipt className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        
                        <h1 className="text-sm font-semibold tracking-tight text-foreground">
                            Order not found
                        </h1>
                        
                        <p className="text-secondary-foreground text-xs mt-1 mb-4 max-w-[240px] leading-normal">
                            We couldn&apos;t find tracking details for this transaction.
                        </p>
                        
                        <button
                            onClick={() => router.push('/orders')}
                            className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white rounded-md text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            Return to Orders
                        </button>
                    </motion.main>
                ) : (
                    <motion.main
                        key="tracking-content"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                        className="mx-auto max-w-4xl px-4 py-6 md:py-8"
                    >
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
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}