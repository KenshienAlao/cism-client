import { ShoppingCart } from "lucide-react";
import { Emptystatetab } from "../emptystatetab";

export default function CartEmpty() {
    return (
        <Emptystatetab
            title="Your Cart is Empty"
            description="Looks like you haven't added anything to your cart yet."
            icon={ShoppingCart}
            actionLabel="Start Browsing"
            actionHref="/"
            className="min-h-screen bg-neutral-50"
        />
    )
}