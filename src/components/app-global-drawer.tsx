"use client";

import { GlobalCartDrawer } from "./globalcartdrawer";
import { useCartDrawer } from "@/context/cart.context";

export function AppGlobalDrawer() {
    const { isCartOpen, closeCart } = useCartDrawer();

    return (
        <GlobalCartDrawer 
            isOpen={isCartOpen}
            onClose={closeCart}
        />
    );
}
