"use client";

import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/cartdrawer";

export function GlobalCartDrawer() {
    const { cartItems, isCartOpen, setCartOpen, updateQuantity, removeItem } = useCart();

    return (
        <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={() => {
                setCartOpen(false);
                // Checkout logic would go here or emit an event
            }}
        />
    );
}
