'use client';

import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, ArrowRight, Store, Trash2, Minus, Plus, Check, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, stalledItems, updateQuantity, removeItem, isMutating, getStock, isLoading } = useCart();

    // Local state for pending quantity changes (before saving)
    const [stagedQuantities, setStagedQuantities] = useState<Record<number, number>>({});

    // Local state for item selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Sync selected IDs when cart items change (initial load)
    useEffect(() => {
        if (cartItems.length > 0 && selectedIds.size === 0) {
            setSelectedIds(new Set(cartItems.map(i => i.id)));
        }
    }, [cartItems]);

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
        router.push('/checkout');
    };

    // --- Render States ---

    if (isLoading && cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-neutral-50">
                <div className="w-20 h-20 bg-white border border-neutral-100 flex items-center justify-center mb-6 rounded-md">
                    <ShoppingCart className="w-8 h-8 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Your Cart is Empty</h1>
                <p className="text-neutral-400 text-xs font-medium max-w-[200px] mt-2 mb-8 leading-relaxed">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-10 py-4 bg-orange-500 text-white rounded-md font-bold text-xs uppercase tracking-widest active:bg-orange-600 transition-colors"
                >
                    Start Browsing
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pb-48">
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">My Cart</h1>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                            {cartItems.length} items
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (selectedIds.size === cartItems.length) setSelectedIds(new Set());
                            else setSelectedIds(new Set(cartItems.map(i => i.id)));
                        }}
                        className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-orange-500 transition-colors"
                    >
                        {selectedIds.size === cartItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-12">
                {stalledItems.map((group) => {
                    const groupItemIds = group.items.map(i => i.id);
                    const allGroupSelected = groupItemIds.every(id => selectedIds.has(id));

                    return (
                        <div key={group.stallName} className="space-y-4">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleGroup(groupItemIds)}>
                                <div className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${allGroupSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-200'}`}>
                                    {allGroupSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Store className="w-3.5 h-3.5 text-orange-500" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">{group.stallName}</h3>
                                </div>
                                <div className="h-px flex-1 bg-neutral-100" />
                            </div>

                            <div className="space-y-4">
                                {group.items.map((item) => {
                                    const qty = stagedQuantities[item.id] ?? item.quantity;
                                    const isSelected = selectedIds.has(item.id);
                                    const maxStock = getStock(item.itemId, item.variationId);
                                    const hasStockIssue = cartSummary.invalidItems.has(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            className={`relative flex gap-4 bg-white p-4 rounded-md border transition-colors ${isSelected ? 'border-orange-200' : 'border-neutral-100'}`}
                                        >
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={`shrink-0 self-center w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-100'}`}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                                            </button>

                                            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Inbox className="w-6 h-6 text-neutral-200" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-neutral-900 truncate mb-0.5">{item.name}</h3>
                                                        {hasStockIssue ? (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                                                <AlertCircle className="w-3 h-3" />
                                                                {maxStock} left in stock
                                                            </div>
                                                        ) : (
                                                            <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">
                                                                {item.variationName || 'Default'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-neutral-200 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-end justify-between gap-2">
                                                    <p className="text-sm font-bold text-orange-500 tracking-tight">₱{(item.price * qty).toFixed(2)}</p>

                                                    <div className="flex items-center gap-3 bg-neutral-50 p-1 rounded-md border border-neutral-100">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded border border-neutral-100 text-neutral-900 active:bg-neutral-50 transition-colors disabled:opacity-30"
                                                            disabled={qty <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" strokeWidth={3} />
                                                        </button>
                                                        <span className={`w-4 text-center text-[10px] font-bold tabular-nums ${stagedQuantities[item.id] !== undefined ? 'text-orange-500' : 'text-neutral-900'}`}>
                                                            {qty}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                                            disabled={qty >= maxStock}
                                                            className="w-7 h-7 flex items-center justify-center bg-white rounded border border-neutral-100 text-neutral-900 active:bg-neutral-50 transition-colors disabled:opacity-30"
                                                        >
                                                            <Plus className="w-3 h-3" strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-24 md:pb-6">
                <div className="max-w-2xl mx-auto bg-neutral-900 border border-white/5 rounded-lg p-5 flex items-center justify-between gap-6 shadow-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">
                            {cartSummary.count} Items
                        </span>
                        <span className="text-xl font-bold text-white tracking-tight">
                            ₱{cartSummary.subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {cartSummary.hasChanges ? (
                            <>
                                <button
                                    onClick={() => setStagedQuantities({})}
                                    className="px-6 py-3 text-white/60 font-bold uppercase text-[10px] tracking-widest active:text-white transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isMutating}
                                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-md uppercase text-[10px] tracking-widest active:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isMutating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleCheckout}
                                disabled={selectedIds.size === 0 || isMutating || cartSummary.hasStockIssues}
                                className="px-10 py-3 bg-orange-500 text-white font-bold rounded-md uppercase text-[10px] tracking-widest active:bg-orange-600 disabled:opacity-30 disabled:grayscale transition-colors flex items-center justify-center gap-2"
                            >
                                Checkout
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
