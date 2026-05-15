'use client';

import { Store, Trash2, Star, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Order } from '@/model/order.model';
import { formatDate } from '@/lib/utils/formatDate';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    PENDING:   { color: 'text-amber-500',   label: 'Pending'   },
    PREPARING: { color: 'text-blue-500',    label: 'Preparing' },
    READY:     { color: 'text-emerald-500', label: 'Ready'     },
    COMPLETED: { color: 'text-neutral-400', label: 'Completed' },
    CANCELLED: { color: 'text-rose-500',    label: 'Cancelled' },
};

interface OrderCartProps {
    order: Order;
    onCancel: (orderId: string) => void;
    onReceive: (orderId: string) => void;
    onDelete: (orderId: string) => void;
    onReview: (order: Order) => void;
}

export function OrderCard({ order, onCancel, onReceive, onDelete, onReview }: OrderCartProps) {
    const config = STATUS_CONFIG[order.status.toUpperCase()] ?? { color: 'text-neutral-400', label: order.status };

    return (
        <div className="bg-white border border-neutral-200">
            {/* Header */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-neutral-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                        {order.stallImage ? (
                            <Image src={order.stallImage} alt={order.stallName} fill className="object-cover" sizes="40px" />
                        ) : (
                            <Store className="w-4 h-4 text-neutral-300" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs md:text-sm font-black text-neutral-900 leading-none mb-0.5 truncate">{order.stallName}</h3>
                        <p className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shrink-0 ${config.color}`}>
                    {config.label}
                </span>
            </div>

            {/* Cancel reason */}
            {order.status.toUpperCase() === 'CANCELLED' && order.cancelReason && (
                <div className="px-4 md:px-6 py-3 border-b border-rose-100 bg-rose-50">
                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <XCircle className="w-3 h-3" /> Rejection Note
                    </p>
                    <p className="text-xs font-medium text-rose-700 italic leading-relaxed">"{order.cancelReason}"</p>
                </div>
            )}

            {/* Items */}
            <div className="px-4 md:px-6 py-4 md:py-5 space-y-4">
                {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-12 h-12 md:w-16 md:h-16 shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden">
                            {item.image && <Image src={item.image} alt={item.itemName} fill className="object-cover" sizes="64px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm md:text-base font-black text-neutral-900 truncate">{item.itemName}</h4>
                            <div className="flex items-center gap-2.5 mt-0.5">
                                <span className="text-[10px] font-bold text-neutral-400">×{item.quantity}</span>
                                {item.variationName && (
                                    <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
                                        {item.variationName}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-sm md:text-base font-black text-neutral-900 shrink-0">
                            ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 md:px-6 py-4 md:py-5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Total</span>
                    <span className="text-lg md:text-2xl font-black text-neutral-900 tracking-tight">₱{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                        <button
                            onClick={() => onCancel(order.id)}
                            className="px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest border border-neutral-200"
                        >
                            Cancel
                        </button>
                    )}
                    {order.status === 'READY' && (
                        <button
                            onClick={() => onReceive(order.id)}
                            className="px-4 md:px-5 py-2 md:py-2.5 bg-emerald-500 text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
                        >
                            Received
                        </button>
                    )}
                    {(order.status === 'CANCELLED' || order.status === 'COMPLETED') && (
                        <button
                            onClick={() => onDelete(order.id)}
                            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-neutral-200 text-neutral-400"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    {order.status === 'COMPLETED' && (
                        <button
                            onClick={() => onReview(order)}
                            className="px-4 md:px-5 py-2 md:py-2.5 border border-orange-500 text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Star className="w-3 h-3 fill-current" />
                            Review
                        </button>
                    )}

                    <Link
                        href={`/orders/${order.id}/track`}
                        className="px-5 md:px-7 py-2 md:py-2.5 bg-orange-500 text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
                    >
                        Track
                    </Link>
                </div>
            </div>
        </div>
    );
}

