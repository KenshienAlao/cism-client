'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Order } from '@/model/order.model';
import { STATUS_ORDER } from '@/config/track.config';
import Timeline from './ordertracking/timeline';
import OrderSummaryTrack from './ordertracking/ordersummarytrack';
import Additonaldetails from './ordertracking/additonaldetails';
import Buttonupdate from './ordertracking/buttonupdate';
import Orderinfo from './ordertracking/orderinfo';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface OrderTrackingProps {
    order: Order;
    onBack: () => void;
    onReview?: () => void;
    onReceive?: () => void;
    isProcessing?: boolean;
}

const staggerItemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } as const
    }
};

const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04 }
    }
};

export function OrderTracking({
    order,
    onBack,
    onReview,
    onReceive,
    isProcessing
}: OrderTrackingProps) {
    const currentStatusIndex = order.status === 'CANCELLED'
        ? -2
        : STATUS_ORDER.indexOf(order.status as OrderStatus);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainerVariants}
            className="w-full bg-background text-foreground text-sm"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 flex flex-col gap-4 w-full min-w-0">
                    <motion.div variants={staggerItemVariants} className="bg-card border border-border rounded-lg p-4">
                        <Orderinfo order={order} />
                    </motion.div>

                    <motion.div variants={staggerItemVariants} className="bg-card border border-border rounded-lg p-4 sm:p-5">
                        <Timeline
                            order={order}
                            currentStatusIndex={currentStatusIndex}
                        />
                    </motion.div>
                    {(order.status === 'READY' || order.status === 'COMPLETED') && (
                        <motion.div variants={staggerItemVariants} className="bg-card border border-border rounded-lg p-4">
                            <Buttonupdate
                                order={order}
                                onReceive={onReceive}
                                onReview={onReview}
                                isProcessing={!!isProcessing}
                            />
                        </motion.div>
                    )}
                </div>
                <div className="lg:col-span-5 flex flex-col gap-4 w-full min-w-0">
                    <motion.div variants={staggerItemVariants} className="bg-card border border-border rounded-lg p-4">
                        <OrderSummaryTrack order={order} />
                    </motion.div>

                    <motion.div variants={staggerItemVariants} className="bg-card border border-border rounded-lg p-4">
                        <Additonaldetails order={order} />
                    </motion.div>
                </div>

            </div>
        </motion.div>
    );
}