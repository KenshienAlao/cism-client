'use client';

import { ShoppingBag } from 'lucide-react';
import { Emptystatetab } from '../emptystatetab';

export function EmptyOrders() {
    return (
        <Emptystatetab
            title="No orders yet"
            description="You haven't placed any orders yet. Start exploring our stalls to find something delicious!"
            icon={ShoppingBag}
            actionLabel="Start Shopping"
            actionHref="/"
            className="min-h-[calc(100vh-65px)] bg-background"
        />
    );
}