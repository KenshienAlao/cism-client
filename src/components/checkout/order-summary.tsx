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
        <div className="smart-card sticky top-20">
            <div className="smart-header justify-between">
                <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">Summary</h2>
                <span className="text-[10px] font-bold text-neutral-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            </div>

            {/* Items (Desktop only) */}
            <div className="hidden lg:block p-5 max-h-[45vh] overflow-y-auto border-b border-black/5">
                <CheckoutItemList groups={groups} />
            </div>

            {/* Totals + CTA */}
            <div className="p-5 space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400 font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-neutral-900 font-bold">₱{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className="text-neutral-400 font-bold uppercase tracking-wider">
                            Delivery {isDeliver && <span className="normal-case text-[9px]">({itemCount} × ₱{deliveryFeePerItem})</span>}
                        </span>
                        {isDeliver
                            ? <span className="text-neutral-900 font-bold">₱{deliveryFee.toFixed(2)}</span>
                            : <span className="text-green-500 font-bold">FREE</span>
                        }
                    </div>
                    <div className="h-px bg-black/5 my-2" />
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Total</span>
                        <span className="text-xl font-black text-neutral-900 tracking-tight">₱{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={isPending}
                    className="w-full bg-neutral-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Processing...' : 'Place Order'}
                    {!isPending && <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />}
                </button>

                <p className="text-[8px] text-center text-neutral-300 font-bold uppercase tracking-[0.15em] leading-relaxed">
                    By placing your order you agree to our terms
                </p>
            </div>
        </div>
    );
}
