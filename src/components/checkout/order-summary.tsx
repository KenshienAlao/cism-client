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
        <div className="bg-card text-foreground">
            {/* Header Content */}
            <div className="pb-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">Summary</h2>
                <span className="text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Item Manifest */}
            <div className="hidden lg:block max-h-[26vh] overflow-y-auto border-b border-border py-3 scrollbar-none">
                <CheckoutItemList groups={groups} />
            </div>

            {/* Calculations */}
            <div className="pt-4 space-y-4">
                <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium text-foreground">
                            ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground">Delivery</span>
                            {isDeliver && (
                                <span className="text-[10px] text-muted-foreground/70">
                                    {itemCount} × ₱{deliveryFeePerItem}
                                </span>
                            )}
                        </div>
                        {isDeliver ? (
                            <span className="font-medium text-foreground">
                                ₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-orange-500">Free</span>
                        )}
                    </div>

                    <div className="pt-3 border-t border-border flex justify-between items-end">
                        <span className="text-sm font-medium text-foreground">Total</span>
                        <span className="text-xl font-semibold text-foreground tracking-tight">
                            ₱{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={onPlaceOrder}
                        disabled={isPending}
                        className="w-full bg-orange-500 text-white h-11 text-sm font-medium rounded-lg flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/40 active:scale-[0.99] disabled:bg-secondary disabled:text-muted-foreground disabled:pointer-events-none"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Place Order'
                        )}
                    </button>

                    <p className="text-[11px] text-center text-muted-foreground">
                        By placing your order, you agree to the terms of fulfillment.
                    </p>
                </div>
            </div>
        </div>
    );
}