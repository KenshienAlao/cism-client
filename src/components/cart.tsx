import { Receipt, ShoppingCart } from "lucide-react";

interface CartProps {
    orders: any[];
    handleViewOrdersList: () => void;
    cartCount: number;
    setCartOpen: (open: boolean) => void;
}

export default function Cart({ orders, handleViewOrdersList, cartCount, setCartOpen }: CartProps) {
    return (
        <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 flex flex-col items-end gap-3 md:gap-4">
            {/* Orders Button */}
            {orders.length > 0 && (
                <button
                    onClick={handleViewOrdersList}
                    className="group relative flex items-center justify-center p-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-2xl active:scale-95 transition-all duration-300"
                    title="View Orders"
                >
                    <Receipt className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 group-hover:rotate-6 transition-all" strokeWidth={2} />
                </button>
            )}

            {/* Cart Button */}
            <button
                onClick={() => setCartOpen(true)}
                className="group relative flex items-center justify-center p-5 bg-orange-500 hover:bg-orange-600 rounded-[2rem] active:scale-90 transition-all duration-300"
            >
                <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2.5} />

                {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-20"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-neutral-900 border-2 border-white text-white text-[10px] font-black items-center justify-center shadow-sm">
                            {cartCount}
                        </span>
                    </div>
                )}
            </button>
        </div>
    );
}