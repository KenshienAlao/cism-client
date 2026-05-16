'use client';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {  Minus, Plus, Trash2, AlertCircle, Check, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Loading from '@/components/ui/loading';

export default function CartPage() {
    const router = useRouter();
    const { isLoading: isAuthLoading } = useAuth();
    const { 
        cartItems, 
        isLoading, 
        updateQuantity, 
        removeItem, 
        isMutating,
        getStock 
    } = useCart();

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    useEffect(() => {
        if (cartItems.length > 0 && selectedIds.size === 0) {
            setSelectedIds(new Set(cartItems.map(item => item.id)));
        }
    }, [cartItems]);

    const cartSummary = useMemo(() => {
        let subtotal = 0;
        let count = 0;
        const invalidItems = new Set<number>();

        cartItems.forEach(item => {
            const currentStock = getStock(item.itemId, item.variationId);

            if (selectedIds.has(item.id)) {
                subtotal += item.price * item.quantity;
                count += item.quantity;
            }

            if (item.quantity > currentStock) {
                invalidItems.add(item.id);
            }
        });

        return {
            subtotal,
            count,
            invalidItems,
            hasStockIssues: invalidItems.size > 0
        };
    }, [cartItems, selectedIds, getStock]);

    const toggleItem = (id: number) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        if (selectedIds.size === cartItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(cartItems.map(item => item.id)));
        }
    };

    const handleUpdateQuantity = (id: number, delta: number) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const maxStock = getStock(item.itemId, item.variationId);
        const newQty = Math.max(1, Math.min(maxStock, item.quantity + delta));

        if (newQty !== item.quantity) {
            updateQuantity(id, newQty);
        }
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0 || cartSummary.hasStockIssues) return;
        const ids = Array.from(selectedIds).join(',');
        router.push(`/checkout?items=${ids}`);
    };

    if (isAuthLoading || (isLoading && !cartItems.length)) {
        return <Loading />;
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-sm text-secondary-foreground mb-4">Your shopping cart is empty.</p>
                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/')}
                    className="text-sm px-4 py-2 rounded-md bg-secondary text-foreground border border-border"
                >
                    Return to Shop
                </motion.button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-orange-500/20">
            <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
                <header className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleAll}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                selectedIds.size === cartItems.length 
                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                    : 'border-border bg-input'
                            }`}
                        >
                            {selectedIds.size === cartItems.length && <Check className="w-2.5 h-2.5 stroke-3" />}
                        </button>
                        <h1 className="text-base font-medium">Shopping Cart</h1>
                    </div>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <main className="lg:col-span-8 space-y-3">
                        <AnimatePresence initial={false}>
                            {cartItems.map((item) => {
                                const maxStock = getStock(item.itemId, item.variationId);
                                const hasStockIssue = cartSummary.invalidItems.has(item.id);

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                                        className={`p-4 rounded-lg bg-card border flex items-center gap-4 transition-colors ${
                                            hasStockIssue ? 'border-orange-500/50' : 'border-border'
                                        }`}
                                    >
                                        {/* Row Selection Box */}
                                        <button 
                                            onClick={() => toggleItem(item.id)}
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                                selectedIds.has(item.id) 
                                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                                    : 'border-border bg-input'
                                            }`}
                                        >
                                            {selectedIds.has(item.id) && <Check className="w-2.5 h-2.5 stroke-3" />}
                                        </button>

                                        {/* Thumbnail */}
                                        <div className="relative w-16 h-16 bg-secondary rounded-md overflow-hidden shrink-0 border border-border flex items-center justify-center">
                                            {item.image ? (
                                                <Image 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    fill
                                                    className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest text-center leading-tight">
                                                    No<br/>Image
                                                </span>
                                            )}
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                                            {/* Info */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h2 className="text-sm font-medium truncate text-foreground">{item.name}</h2>
                                                
                                                <p className="text-xs text-secondary-foreground">
                                                    ${item.price.toFixed(2)} {item.variationName ? `| ${item.variationName}` : ''}
                                                </p>

                                                {hasStockIssue && (
                                                    <p className="text-xs text-orange-500 flex items-center gap-1 font-medium">
                                                        <AlertCircle className="w-3 h-3" /> Exceeds available stock ({maxStock})
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions & Price */}
                                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 mt-1 sm:mt-0">
                                                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>

                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    {/* Step Increment Segment */}
                                                    <div className="flex items-center border border-border bg-input rounded-md overflow-hidden">
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                                            disabled={item.quantity <= 1 || isMutating}
                                                            className="p-1.5 text-secondary-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </motion.button>
                                                        <span className="text-xs font-medium w-6 text-center select-none text-foreground">
                                                            {item.quantity}
                                                        </span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                                            disabled={item.quantity >= maxStock || isMutating}
                                                            className="p-1.5 text-secondary-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </motion.button>
                                                    </div>

                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={isMutating}
                                                        className="p-2 text-secondary-foreground hover:text-orange-500 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </main>

                    {/* Right Column: Checkout Summary Station */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                            <h2 className="text-sm font-medium border-b border-border pb-3">Order Summary</h2>
                            
                            <div className="space-y-2.5 text-sm">
                                <div className="flex justify-between text-secondary-foreground">
                                    <span>Selected Items ({cartSummary.count})</span>
                                    <span>${cartSummary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between font-medium text-base text-foreground">
                                    <span>Total Subtotal</span>
                                    <span>${cartSummary.subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* State Resolution Action Layer */}
                            <div className="space-y-2 pt-2">
                                <motion.button
                                    whileTap={selectedIds.size > 0 && !cartSummary.hasStockIssues ? { scale: 0.99 } : {}}
                                    onClick={handleCheckout}
                                    disabled={selectedIds.size === 0 || cartSummary.hasStockIssues}
                                    className="w-full text-sm py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-secondary disabled:text-secondary-foreground text-white font-medium rounded-md transition-colors flex items-center justify-center outline-none focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed"
                                >
                                    Proceed to Checkout
                                </motion.button>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}