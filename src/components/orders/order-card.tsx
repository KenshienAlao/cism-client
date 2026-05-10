'use client';

import { Store, MapPin, Trash2, Star, Clock, CheckCircle2, ChevronRight, XCircle, Receipt, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { Order } from '@/model/order.model';
import { formatDate } from '@/lib/utils/formatDate';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
    PENDING: { color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
    PREPARING: { color: 'text-blue-500', bg: 'bg-blue-50', icon: Clock },
    READY: { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
    COMPLETED: { color: 'text-neutral-500', bg: 'bg-neutral-50', icon: CheckCircle2 },
    CANCELLED: { color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle },
};

interface OrderCartProps {
    order: Order;
    onCancel: (orderId: string) => void;
    onReceive: (orderId: string) => void;
    onDelete: (orderId: string) => void;
    onReview: (order: Order) => void;
}

export function OrderCard({ order, onCancel, onReceive, onDelete, onReview }: OrderCartProps) {
    const config = STATUS_CONFIG[order.status.toUpperCase()];

    return (
        <div className="bg-white border border-neutral-100 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded bg-neutral-50 flex items-center justify-center overflow-hidden border border-neutral-100">
                        {order.stallImage ? (
                            <Image src={order.stallImage} alt={order.stallName} fill className="object-cover" />
                        ) : (
                            <Store className="w-4 h-4 text-neutral-300" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-neutral-900 leading-none mb-1">{order.stallName}</h3>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded-sm ${config.bg} ${config.color} text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5`}>
                    <config.icon className="w-2.5 h-2.5" />
                    {order.status}
                </div>
            </div>

            {/* Items */}
            <div className="p-5 space-y-4">
                {order.status.toUpperCase() === 'CANCELLED' && order.cancelReason && (
                    <div className="p-4 bg-rose-50 rounded-md border border-rose-100">
                        <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <XCircle className="w-3 h-3" /> Rejection Note
                        </p>
                        <p className="text-xs font-medium text-rose-800 italic leading-relaxed">"{order.cancelReason}"</p>
                    </div>
                )}
                <div className="space-y-4">
                    {order.orderItems.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-neutral-50 border border-neutral-100">
                                {item.image && <Image src={item.image} alt={item.itemName} fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-neutral-900 truncate">{item.itemName}</h4>
                                <div className="flex items-center gap-2.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-neutral-400">Qty: {item.quantity}</span>
                                    {item.variationName && (
                                        <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
                                            {item.variationName}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-bold text-neutral-900 shrink-0">₱{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Total</span>
                    <span className="text-lg font-bold text-neutral-900 tracking-tight">₱{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                        <button
                            onClick={() => onCancel(order.id)}
                            className="px-4 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest active:text-rose-500"
                        >
                            Cancel
                        </button>
                    )}
                    {order.status === 'READY' && (
                        <button
                            onClick={() => onReceive(order.id)}
                            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md active:bg-emerald-600"
                        >
                            Received
                        </button>
                    )}
                    {(order.status === 'CANCELLED' || order.status === 'COMPLETED') && (
                        <button
                            onClick={() => onDelete(order.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-400 active:bg-rose-50 active:text-rose-500 active:border-rose-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    {order.status === 'COMPLETED' && (
                        <button
                            onClick={() => onReview(order)}
                            className="px-4 py-2 border border-orange-500 text-orange-500 text-[10px] font-bold uppercase tracking-widest rounded-md active:bg-orange-500 active:text-white flex items-center gap-2"
                        >
                            <Star className="w-3 h-3 fill-current" />
                            Review
                        </button>
                    )}

                    <Link
                        href={`/orders/${order.id}/track`}
                        className="px-6 py-2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md active:bg-orange-600 transition-colors"
                    >
                        Track
                    </Link>
                </div>
            </div>
        </div>
    );
}
