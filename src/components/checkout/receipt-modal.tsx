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
    const mainReceipt = orders[0]?.receipt || 'N/A';
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
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-neutral-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-50 text-neutral-400 hover:text-neutral-900 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center">
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    </div>

                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Order Placed!</h2>
                    <p className="text-neutral-500 text-[13px] mt-1 mb-8">Thank you for your purchase.</p>

                    {/* Receipt Section */}
                    <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-6 mb-6 group relative">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Order Receipt Code</span>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl font-black text-neutral-900 font-mono tracking-tight">
                                {mainReceipt}
                            </span>
                            <button
                                onClick={() => copyToClipboard(mainReceipt)}
                                className="p-2 bg-white border border-neutral-100 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-900 transition-all active:scale-90 shadow-sm"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        {orders.length > 1 && (
                            <p className="text-[10px] text-neutral-400 mt-2 font-medium">
                                + {orders.length - 1} other {orders.length - 1 === 1 ? 'stall' : 'stalls'} in this checkout
                            </p>
                        )}
                    </div>

                    {/* Checkout Details */}
                    <div className="space-y-3 mb-8 bg-neutral-50/50 p-5 rounded-2xl text-left">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-neutral-500">Payment</span>
                            <span className="text-xs font-bold text-neutral-900 uppercase tracking-tight">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-neutral-500">Method</span>
                            <span className="text-xs font-bold text-neutral-900 uppercase tracking-tight">{deliveryMethod}</span>
                        </div>
                        <div className="pt-3 mt-1 border-t border-neutral-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-neutral-900">Total Paid</span>
                            <span className="text-xl font-black text-neutral-900">₱{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleViewOrders}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-xl shadow-neutral-900/10"
                        >
                            Track Order Status
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-neutral-400 font-bold text-[10px] uppercase tracking-widest"
                        >
                            Back to Market
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

