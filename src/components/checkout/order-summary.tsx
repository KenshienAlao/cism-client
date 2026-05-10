import { Loader2 } from 'lucide-react';
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
        <div className="bg-white border border-neutral-200 lg:sticky lg:top-8">

            {/* Header */}
            <div className="px-5 md:px-7 py-4 md:py-5 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-[10px] md:text-xs font-black text-neutral-900 uppercase tracking-[0.2em]">Summary</h2>
                <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                </span>
            </div>

            {/* Item list — desktop only */}
            <div className="hidden lg:block max-h-[38vh] overflow-y-auto border-b border-neutral-200">
                <div className="p-5">
                    <CheckoutItemList groups={groups} />
                </div>
            </div>

            {/* Totals */}
            <div className="p-5 md:p-7 space-y-8">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-sm font-black text-neutral-900 tracking-tight">
                            ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Delivery</span>
                            {isDeliver && (
                                <span className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest">
                                    {itemCount} × ₱{deliveryFeePerItem}
                                </span>
                            )}
                        </div>
                        {isDeliver ? (
                            <span className="text-sm font-black text-neutral-900 tracking-tight">
                                ₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        ) : (
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Free</span>
                        )}
                    </div>

                    <div className="pt-5 border-t border-neutral-200 flex justify-between items-end">
                        <span className="text-[10px] md:text-xs font-black text-neutral-900 uppercase tracking-[0.2em]">Total</span>
                        <span className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter">
                            ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={isPending}
                    className="w-full bg-orange-500 text-white py-4 md:py-5 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs flex items-center justify-center disabled:bg-neutral-100 disabled:text-neutral-300"
                >
                    {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Place Order'
                    )}
                </button>

                <p className="text-[8px] md:text-[9px] text-center text-neutral-400 font-bold uppercase tracking-[0.2em]">
                    Agreement on placement applies
                </p>
            </div>
        </div>
    );
}
