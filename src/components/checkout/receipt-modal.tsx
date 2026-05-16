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
        <div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-0 sm:p-4 antialiased">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Box Container */}
            <div className="relative w-full sm:max-w-md bg-card border-t sm:border border-border rounded-t-lg sm:rounded-lg overflow-hidden shadow-none">

                {/* Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-medium text-foreground">
                            Order Confirmed
                        </h2>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Receipt Highlight Wrapper */}
                <div className="px-4 py-5 border-b border-border bg-secondary/40">
                    <p className="text-xs text-muted-foreground mb-1">
                        Receipt Code
                    </p>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-2xl font-mono font-semibold text-foreground tracking-tight select-all">
                            {mainReceipt}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(mainReceipt)}
                            className="w-9 h-9 border border-border bg-card rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground active:bg-secondary transition-colors shrink-0"
                            title="Copy Code"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    {orders.length > 1 && (
                        <p className="text-xs text-orange-500 font-medium mt-1.5">
                            Consolidated billing • {orders.length} vendor stalls
                        </p>
                    )}
                </div>

                {/* Logistics & Settlement Breakdown */}
                <div className="px-4 py-4 border-b border-border space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Settlement</span>
                        <span className="font-medium text-foreground capitalize">{paymentMethod.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Logistics</span>
                        <span className="font-medium text-foreground capitalize">{deliveryMethod.toLowerCase()}</span>
                    </div>
                    <div className="pt-2.5 border-t border-border flex justify-between items-end">
                        <span className="text-sm text-muted-foreground">Total Paid</span>
                        <span className="text-xl font-semibold text-foreground tracking-tight">
                            ₱{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Action Block */}
                <div className="p-4 space-y-1.5">
                    <button
                        type="button"
                        onClick={handleViewOrders}
                        className="w-full bg-orange-500 text-white h-11 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/40 active:scale-[0.99]"
                    >
                        Track Order
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-9 text-sm text-muted-foreground hover:text-foreground font-medium rounded-lg transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
}