'use client';

import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, ArrowRight, Store, Trash2, Minus, Plus, Check, Loader2, Inbox } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, stalledItems, updateQuantity, removeItem, isMutating, getStock } = useCart();
    const [stagedQuantities, setStagedQuantities] = useState<Record<number, number>>({});
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (cartItems.length > 0 && selectedIds.size === 0) {
            setSelectedIds(new Set(cartItems.map(i => i.id)));
        }
    }, [cartItems]);

    const { selectedSubtotal, selectedCount, hasChanges } = useMemo(() => {
        let selSub = 0, selCount = 0;
        cartItems.forEach(item => {
            const qty = stagedQuantities[item.id] ?? item.quantity;
            if (selectedIds.has(item.id)) {
                selSub += item.price * qty;
                selCount += qty;
            }
        });
        return {
            selectedSubtotal: selSub,
            selectedCount: selCount,
            hasChanges: Object.keys(stagedQuantities).length > 0
        };
    }, [cartItems, stagedQuantities, selectedIds]);

    const toggleItem = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleGroup = (groupIds: number[]) => {
        const allSelected = groupIds.every(id => selectedIds.has(id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            groupIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
            return next;
        });
    };

    const handleUpdateQuantity = (id: number, delta: number) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const currentQty = stagedQuantities[id] ?? item.quantity;
        const maxStock = getStock(item.itemId, item.variationId);
        const newQty = Math.max(1, Math.min(maxStock, currentQty + delta));

        if (newQty === currentQty) return;

        if (newQty === item.quantity) {
            const { [id]: _, ...rest } = stagedQuantities;
            setStagedQuantities(rest);
        } else {
            setStagedQuantities(prev => ({ ...prev, [id]: newQty }));
        }
    };

    const handleSaveChanges = async () => {
        for (const [id, qty] of Object.entries(stagedQuantities)) {
            await updateQuantity(Number(id), qty);
        }
        setStagedQuantities({});
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0) return;
        // In a real app, you might pass selected IDs via state or query
        router.push('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-neutral-100 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">Your cart is empty</h1>
                <p className="text-neutral-400 text-sm mb-10 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-10 py-4 bg-neutral-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:bg-neutral-800 transition-all"
                >
                    Go Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-black tracking-tight text-neutral-900">Shopping Cart</h1>
                    <button 
                        onClick={() => {
                            if (selectedIds.size === cartItems.length) setSelectedIds(new Set());
                            else setSelectedIds(new Set(cartItems.map(i => i.id)));
                        }}
                        className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 transition-all"
                    >
                        {selectedIds.size === cartItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {stalledItems.map((group) => {
                    const groupItemIds = group.items.map(i => i.id);
                    const allGroupSelected = groupItemIds.every(id => selectedIds.has(id));

                    return (
                        <div key={group.stallName} className="space-y-4">
                            <div className="flex items-center gap-3 px-2">
                                <button
                                    onClick={() => toggleGroup(groupItemIds)}
                                    className={`shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${allGroupSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-200'}`}
                                >
                                    {allGroupSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                </button>
                                <Store className="w-4 h-4 text-orange-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">{group.stallName}</h3>
                                <div className="h-px flex-1 bg-neutral-100 ml-2" />
                            </div>

                            <div className="space-y-3">
                                {group.items.map((item) => {
                                    const qty = stagedQuantities[item.id] ?? item.quantity;
                                    const isSelected = selectedIds.has(item.id);
                                    const maxStock = getStock(item.itemId, item.variationId);

                                    return (
                                        <div key={item.id} className={`group flex gap-4 bg-white p-4 rounded-[1.5rem] border transition-all ${isSelected ? 'border-orange-200 bg-orange-50/10' : 'border-neutral-100'}`}>
                                            <button
                                                onClick={() => toggleItem(item.id)}
                                                className={`shrink-0 self-center w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-200'}`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                            </button>

                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                                                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-sm font-bold text-neutral-900 truncate">{item.name}</h3>
                                                    <button 
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-neutral-300 hover:text-rose-500 transition-colors p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-base font-black text-orange-500">₱{(item.price * qty).toFixed(2)}</p>
                                                    
                                                    <div className="flex items-center gap-3 bg-neutral-50 p-1 rounded-xl border border-neutral-100">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-neutral-600 active:scale-90 transition-all disabled:opacity-50"
                                                        >
                                                            <Minus className="w-3 h-3" strokeWidth={3} />
                                                        </button>
                                                        <span className={`w-4 text-center text-xs font-bold ${stagedQuantities[item.id] !== undefined ? 'text-orange-500' : 'text-neutral-900'}`}>
                                                            {qty}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                                            disabled={qty >= maxStock}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-neutral-600 active:scale-90 transition-all disabled:opacity-50"
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

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-24 left-0 right-0 z-40 px-4 pointer-events-none">
                <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-black/5 rounded-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            {selectedCount} Items Selected
                        </span>
                        <span className="text-2xl font-black text-neutral-900 tracking-tighter">
                            ₱{selectedSubtotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex gap-3">
                        {hasChanges ? (
                            <>
                                <button 
                                    onClick={() => setStagedQuantities({})}
                                    className="px-6 py-4 bg-neutral-100 text-neutral-500 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-neutral-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveChanges}
                                    disabled={isMutating}
                                    className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={handleCheckout}
                                disabled={selectedCount === 0 || isMutating}
                                className="px-10 py-4 bg-orange-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                            >
                                Checkout ({selectedCount})
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
