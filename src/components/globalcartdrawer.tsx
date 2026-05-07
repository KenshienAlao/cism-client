"use client";

import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "@/components/cartdrawer";
import { CartResponse } from "@/model/cart.model";
import { StalledCart } from "@/hooks/use-cart";

interface GlobalCartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems?: CartResponse[];
    stalledItems?: StalledCart[];
    isMutating?: boolean;
    updateQuantity?: (id: number, quantity: number) => void;
    removeItem?: (id: number) => void;
}

export function GlobalCartDrawer({ 
    isOpen, 
    onClose, 
    cartItems: propCartItems, 
    stalledItems: propStalledItems, 
    isMutating: propIsMutating, 
    updateQuantity: propUpdateQuantity, 
    removeItem: propRemoveItem 
}: GlobalCartDrawerProps) {
    const hook = useCart();

    const cartItems = propCartItems ?? hook.cartItems;
    const stalledItems = propStalledItems ?? hook.stalledItems;
    const isMutating = propIsMutating ?? hook.isMutating;
    const updateQuantity = propUpdateQuantity ?? hook.updateQuantity;
    const removeItem = propRemoveItem ?? hook.removeItem;

    return (
        <CartDrawer
            isOpen={isOpen}
            onClose={() => onClose()}
            items={cartItems}
            groups={stalledItems}
            isMutating={isMutating}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onCheckout={() => {
                onClose();
            }}
        />
    );
}
