'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { Order } from '@/model/order.model';
import { notifSuccess } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
}

export function ReceiptModal({ isOpen, onClose, orders }: ReceiptModalProps) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen || !orders || !Array.isArray(orders) || orders.length === 0) return null;

    const totalAmount = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    const mainReceipt = orders[0]?.orderCode || 'N/A';
    const deliveryMethod = orders[0]?.deliveryMethod || 'N/A';
    const paymentMethod = orders[0]?.paymentMethod || 'N/A';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        notifSuccess('Receipt code copied!');
    };

    const handleViewOrders = () => {
        onClose();
        router.push('/orders');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full md:max-w-md bg-white border border-neutral-200">

                {/* Header */}
                <div className="px-5 md:px-8 py-4 md:py-5 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                        <h2 className="text-xs md:text-sm font-black text-neutral-900 uppercase tracking-[0.2em]">
                            Order Confirmed
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 p-1">
                        <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>

                {/* Receipt code block */}
                <div className="px-5 md:px-8 py-6 md:py-8 border-b border-neutral-200 bg-neutral-50">
                    <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-2">
                        Receipt Code
                    </p>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-2xl md:text-4xl font-black text-neutral-900 font-mono tracking-tight">
                            {mainReceipt}
                        </span>
                        <button
                            onClick={() => copyToClipboard(mainReceipt)}
                            className="w-9 h-9 md:w-10 md:h-10 border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 shrink-0"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    {orders.length > 1 && (
                        <p className="text-[8px] md:text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-2">
                            Consolidated · {orders.length} stalls
                        </p>
                    )}
                </div>

                {/* Detail rows */}
                <div className="px-5 md:px-8 py-5 md:py-6 border-b border-neutral-200 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Settlement</span>
                        <span className="text-[10px] md:text-xs font-black text-neutral-900 uppercase">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Logistics</span>
                        <span className="text-[10px] md:text-xs font-black text-neutral-900 uppercase">{deliveryMethod}</span>
                    </div>
                    <div className="pt-3 border-t border-neutral-200 flex justify-between items-end">
                        <span className="text-[10px] md:text-xs font-black text-neutral-900 uppercase tracking-[0.2em]">Total</span>
                        <span className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tighter">
                            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-5 md:px-8 py-4 md:py-6 space-y-2">
                    <button
                        onClick={handleViewOrders}
                        className="w-full bg-orange-500 text-white py-3 md:py-4 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs flex items-center justify-center gap-2"
                    >
                        Track
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em]"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
