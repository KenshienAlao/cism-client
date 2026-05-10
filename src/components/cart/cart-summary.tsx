import { ArrowRight, Loader2 } from "lucide-react";

interface CartSummaryProps {
    cartSummary: {
        count?: number;
        subtotal?: number;
        hasChanges?: boolean;
        hasStockIssues?: boolean;
    };
    isMutating: boolean;
    selectedIds: Set<number>;
    setStagedQuantities: (quantities: Record<number, number>) => void;
    handleSaveChanges: () => void;
    handleCheckout: () => void;
}

export function CartSummary({ cartSummary, isMutating, selectedIds, setStagedQuantities, handleSaveChanges, handleCheckout }: CartSummaryProps) {
    return (
        <div className="fixed md:bottom-20 bottom-0 left-0 right-0 z-50 w-full bg-white border-t border-neutral-200">
            <div className="max-w-4xl mx-auto w-full px-4 md:px-8 p-4 md:p-6 pb-20 md:pb-6 flex items-center justify-between gap-4 md:gap-6">
                <div className="flex flex-col min-w-0">
                    <span className="text-[9px] md:text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-0.5 md:mb-1">
                        {cartSummary.count || 0} Items
                    </span>
                    <span className="text-lg md:text-3xl font-bold text-neutral-900 tracking-tight truncate">
                        ₱{(cartSummary.subtotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {cartSummary.hasChanges ? (
                        <>
                            <button
                                onClick={() => setStagedQuantities({})}
                                className="px-4 md:px-6 py-3 md:py-4 text-neutral-400 font-bold uppercase text-[9px] md:text-xs tracking-widest"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isMutating}
                                className="px-6 md:px-10 py-3 md:py-4 bg-orange-500 text-white font-bold uppercase text-[9px] md:text-xs tracking-widest flex items-center justify-center gap-2"
                            >
                                {isMutating ? <Loader2 className="w-3.5 h-3.5 md:w-5 md:h-5 animate-spin" /> : 'Save'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleCheckout}
                            disabled={selectedIds.size === 0 || isMutating || cartSummary.hasStockIssues}
                            className="px-6 md:px-12 py-3 md:py-4 bg-orange-500 text-white font-bold uppercase text-[9px] md:text-xs tracking-widest disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 md:gap-3"
                        >
                            Checkout
                            <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5" strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}