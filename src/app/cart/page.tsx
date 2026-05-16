'use client';

import { useCart } from '@/hooks/use-cart';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartHeader } from '@/components/cart/cart-header';
import CartMain from '@/components/cart/cart-main';
import CartEmpty from '@/components/cart/cart-empty';
import { CartSummary } from '@/components/cart/cart-summary';
import { Loader2 } from 'lucide-react';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, stalledItems, updateQuantity, removeItem, isMutating, getStock, isLoading } = useCart();

    // Local state for pending quantity changes (before saving)
    const [stagedQuantities, setStagedQuantities] = useState<Record<number, number>>({});

    // Local state for item selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());


    const cartSummary = useMemo(() => {
        let subtotal = 0;
        let count = 0;
        const invalidItems = new Set<number>();

        cartItems.forEach(item => {
            const qty = stagedQuantities[item.id] ?? item.quantity;
            const currentStock = getStock(item.itemId, item.variationId);

            if (selectedIds.has(item.id)) {
                subtotal += item.price * qty;
                count += qty;
            }

            // Mark items that exceed current stock (due to WebSocket updates)
            if (qty > currentStock) {
                invalidItems.add(item.id);
            }
        });

        return {
            subtotal,
            count,
            invalidItems,
            hasChanges: Object.keys(stagedQuantities).length > 0,
            hasStockIssues: invalidItems.size > 0
        };
    }, [cartItems, stagedQuantities, selectedIds, getStock]);



    const toggleItem = (id: number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const toggleGroup = (groupIds: number[]) => {
        const allSelected = groupIds.every(id => selectedIds.has(id));
        const next = new Set(selectedIds);
        groupIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
        setSelectedIds(next);
    };

    const handleUpdateQuantity = (id: number, delta: number) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const currentQty = stagedQuantities[id] ?? item.quantity;
        const maxStock = getStock(item.itemId, item.variationId);
        const newQty = Math.max(1, Math.min(maxStock, currentQty + delta));

        if (newQty === currentQty) return;

        // If returning to original quantity, remove from staged
        if (newQty === item.quantity) {
            const next = { ...stagedQuantities };
            delete next[id];
            setStagedQuantities(next);
        } else {
            setStagedQuantities(prev => ({ ...prev, [id]: newQty }));
        }
    };

    const handleSaveChanges = async () => {
        try {
            const updates = Object.entries(stagedQuantities).map(([id, qty]) =>
                updateQuantity(Number(id), qty)
            );
            await Promise.all(updates);
            setStagedQuantities({});
        } catch (error) {
            // Error handled by hook notifications
        }
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0 || cartSummary.hasStockIssues) return;
        const ids = Array.from(selectedIds).join(',');
        router.push(`/checkout?items=${ids}`);
    };

    // --- Render States ---

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (cartItems.length === 0) return <CartEmpty />

    return (
        <div className="min-h-screen bg-neutral-50 pb-10">
            {/* header */}
            <CartHeader cartItems={cartItems} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />

            {/* main */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12">
                <CartMain
                    stalledItems={stalledItems}
                    selectedIds={selectedIds}
                    stagedQuantities={stagedQuantities}
                    getStock={getStock}
                    cartSummary={cartSummary}
                    toggleItem={toggleItem}
                    toggleGroup={toggleGroup}
                    handleUpdateQuantity={handleUpdateQuantity}
                    removeItem={removeItem}
                />
            </main>

            {/* summary */}
            <CartSummary
                cartSummary={cartSummary}
                isMutating={isMutating}
                selectedIds={selectedIds}
                setStagedQuantities={setStagedQuantities}
                handleSaveChanges={handleSaveChanges}
                handleCheckout={handleCheckout}
            />
        </div>
    );
}
