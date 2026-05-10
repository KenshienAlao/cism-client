'use client';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Manifest */}
            <div className="relative w-full max-w-sm bg-white border border-neutral-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-300 active:text-neutral-900 z-10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 md:p-10 text-center">
                    {/* Status Identification */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 border border-emerald-100 mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>

                    <h2 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase mb-2">Order Confirmed</h2>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10">Transaction Proof Generated</p>

                    {/* Receipt Identification */}
                    <div className="bg-neutral-50 border border-neutral-200 p-8 mb-8 relative">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3 block">Receipt Code</span>
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-3xl font-black text-neutral-900 font-mono tracking-tight">
                                {mainReceipt}
                            </span>
                            <button
                                onClick={() => copyToClipboard(mainReceipt)}
                                className="p-2.5 bg-white border border-neutral-200 text-neutral-400 active:bg-neutral-900 active:text-white transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        {orders.length > 1 && (
                            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest mt-4">
                                Consolidated Multi-Stall Manifest
                            </p>
                        )}
                    </div>

                    {/* Detail Manifest */}
                    <div className="space-y-4 mb-10 bg-neutral-50/50 p-6 border border-neutral-100 text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Settlement</span>
                            <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Logistics</span>
                            <span className="text-xs font-black text-neutral-900 uppercase tracking-tight">{deliveryMethod}</span>
                        </div>
                        <div className="pt-4 mt-2 border-t border-neutral-100 flex justify-between items-end">
                            <span className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em]">Total</span>
                            <span className="text-2xl font-black text-neutral-900 tracking-tighter">₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleViewOrders}
                            className="w-full bg-orange-500 text-white py-5 font-black uppercase tracking-[0.3em] text-[11px] active:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Track Manifest
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 text-neutral-400 font-black text-[9px] uppercase tracking-[0.4em] active:text-neutral-900 transition-colors"
                        >
                            Return to Market
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

