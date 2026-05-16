'use client';

import { Order } from "@/model/order.model";
import { Star, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonupdateProps {
    order: Order;
    onReceive?: () => void;
    onReview?: () => void;
    isProcessing: boolean;
}

const buttonVariants = {
    hidden: { opacity: 0, y: 4 } as const,
    visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } } as const,
    exit: { opacity: 0, y: -4, transition: { duration: 0.1 } } as const
};

export default function Buttonupdate({ order, onReceive, onReview, isProcessing }: ButtonupdateProps) {
    return (
        <AnimatePresence mode="wait">
            {order.status === 'READY' && onReceive && (
                <motion.button
                    key="receive"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={buttonVariants}
                    whileTap={{ scale: 0.985 }}
                    onClick={onReceive}
                    disabled={isProcessing}
                    className="w-full bg-orange-500 text-white py-2.5 px-4 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50 select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    <span>{isProcessing ? 'Processing...' : 'Mark as Received'}</span>
                </motion.button>
            )}

            {order.status === 'COMPLETED' && onReview && (
                <motion.button
                    key="review"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={buttonVariants}
                    whileTap={{ scale: 0.985 }}
                    onClick={onReview}
                    className="w-full bg-accent text-accent-foreground border border-border py-2.5 px-4 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>Leave a Review</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}