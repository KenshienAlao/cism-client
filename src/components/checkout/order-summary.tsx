import { ChevronRight } from 'lucide-react';
import { StalledCart } from '@/hooks/use-cart';
import { CheckoutItemList } from './item-list';

interface OrderSummaryProps {
    groups: StalledCart[];
    itemCount: number;
    subtotal: number;
    deliveryFee: number;
    grandTotal: number;
    isDeliver: boolean;
    deliveryFeePerItem: number;
    onPlaceOrder: () => void;
    isPending?: boolean;
}

export function OrderSummary({
    groups, itemCount, subtotal, deliveryFee, grandTotal, isDeliver, deliveryFeePerItem, onPlaceOrder, isPending
}: OrderSummaryProps) {
    return (
        <div className="bg-white border border-neutral-200 lg:sticky lg:top-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em]">Summary</h2>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
            </div>

            {/* Item Manifest */}
            <div className="hidden lg:block max-h-[40vh] overflow-y-auto border-b border-neutral-100">
                <div className="p-2">
                    <CheckoutItemList groups={groups} />
                </div>
            </div>

            {/* Totals */}
            <div className="p-6 md:p-10 space-y-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-sm font-black text-neutral-900 tracking-tight">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Delivery</span>
                            {isDeliver && (
                                <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">
                                    {itemCount} × ₱{deliveryFeePerItem}
                                </span>
                            )}
                        </div>
                        {isDeliver ? (
                            <span className="text-sm font-black text-neutral-900 tracking-tight">₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        ) : (
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Free</span>
                        )}
                    </div>

                    <div className="pt-8 border-t border-neutral-200 flex justify-between items-end">
                        <span className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.2em]">Total</span>
                        <span className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tighter">
                            ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={isPending}
                    className="w-full bg-orange-500 text-white py-6 font-black uppercase tracking-[0.3em] text-[11px] active:bg-orange-600 transition-colors flex items-center justify-center gap-3 disabled:bg-neutral-100 disabled:text-neutral-300 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <div className="flex gap-2">
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                        </div>
                    ) : (
                        <>
                            Place Order
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>

                <p className="text-[9px] text-center text-neutral-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    Agreement on placement applies
                </p>
            </div>
        </div>
    );
}
