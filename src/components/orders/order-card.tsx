'use client';

import { Store, Trash2, Star, XCircle, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Order } from '@/model/order.model';
import { formatDate } from '@/lib/utils/formatDate';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';


const STATUS_CONFIG: Record<string, { textColor: string; label: string; dotColor: string }> = {
    PENDING:   { textColor: 'text-orange-500',                dotColor: 'bg-orange-400', label: 'Pending' },
    PREPARING: { textColor: 'text-orange-500',                dotColor: 'bg-orange-400', label: 'Preparing' },
    READY:     { textColor: 'text-green-500',                 dotColor: 'bg-green-400',  label: 'Ready' },
    COMPLETED: { textColor: 'text-muted-foreground',          dotColor: 'bg-muted-foreground', label: 'Completed' },
    CANCELLED: { textColor: 'text-muted-foreground/60',       dotColor: 'bg-muted-foreground/40', label: 'Cancelled' },
};

const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.04, duration: 0.2, ease: 'easeOut' as const }
    }),
};

interface OrderCartProps {
    order: Order;
    onCancel: (orderId: string) => void;
    onReceive: (orderId: string) => void;
    onDelete: (orderId: string) => void;
    onReview: (order: Order) => void;
}

export function OrderCard({ order, onCancel, onReceive, onDelete, onReview }: OrderCartProps) {
    const config = STATUS_CONFIG[order.status.toUpperCase()] ?? { textColor: 'text-muted-foreground', dotColor: 'bg-muted', label: order.status };
    const isCancelled = order.status.toUpperCase() === 'CANCELLED';
    const isReady = order.status.toUpperCase() === 'READY';
    const [isReceiving, setIsReceiving] = useState(false);

    const handleReceive = async (id: string) => {
        setIsReceiving(true);
        await onReceive(id);
    };

    return (
        <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.15 }}
            className="bg-card text-card-foreground rounded-lg overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 shrink-0 bg-secondary border border-border rounded-lg overflow-hidden flex items-center justify-center">
                        {order.stallImage ? (
                            <Image src={order.stallImage} alt={order.stallName} fill className="object-cover" sizes="36px" />
                        ) : (
                            <Store className="w-4 h-4 text-muted-foreground/50" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate leading-tight">{order.stallName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                </div>

                {/* Live status badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-2 w-2">
                        {(order.status === 'PENDING' || order.status === 'PREPARING' || order.status === 'READY') && (
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${config.dotColor}`} />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${config.textColor}`}>
                        {config.label}
                    </span>
                </div>
            </div>

            {/* ── Cancel Reason ── */}
            <AnimatePresence>
                {isCancelled && order.cancelReason && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-3 border-b border-border bg-secondary/30 text-sm overflow-hidden"
                    >
                        <p className="font-medium text-foreground flex items-center gap-1.5 mb-1">
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground" /> Rejection Note
                        </p>
                        <p className="text-muted-foreground italic text-xs">"{order.cancelReason}"</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Order Items ── */}
            <div className="p-4 divide-y divide-border/50">
                {order.orderItems.map((item: any, index: number) => (
                    <motion.div
                        key={item.id}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex items-center gap-3 ${index > 0 ? 'pt-3 mt-3' : ''}`}
                    >
                        <div className="relative w-11 h-11 shrink-0 bg-secondary border border-border rounded-md overflow-hidden">
                            {item.image && <Image src={item.image} alt={item.itemName} fill className="object-cover" sizes="44px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{item.itemName}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>×{item.quantity}</span>
                                {item.variationName && (
                                    <span className="border-l border-border pl-2">{item.variationName}</span>
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground shrink-0">
                            ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-3 bg-secondary/20 border-t border-border flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</span>
                    <span className="text-base font-bold text-foreground tabular-nums">₱{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onCancel(order.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-input border border-border rounded-md transition-colors"
                        >
                            Cancel
                        </motion.button>
                    )}

                    {isReady && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReceive(order.id)}
                            disabled={isReceiving}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center gap-1.5 disabled:opacity-70"
                        >
                            {isReceiving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            )}
                            Received
                        </motion.button>
                    )}

                    {(isCancelled || order.status === 'COMPLETED') && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(order.id)}
                            className="p-1.5 flex items-center justify-center border border-border bg-input text-muted-foreground hover:text-foreground rounded-md transition-colors"
                            aria-label="Delete order"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                    )}

                    {order.status === 'COMPLETED' && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onReview(order)}
                            className="px-3 py-1.5 border border-orange-500 text-orange-500 hover:bg-orange-500/10 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                        >
                            <Star className="w-3 h-3 fill-current" />
                            Review
                        </motion.button>
                    )}

                    <motion.div whileTap={{ scale: 0.95 }}>
                        <Link
                            href={`/orders/${order.id}/track`}
                            className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-md hover:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            Track
                        </Link>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
