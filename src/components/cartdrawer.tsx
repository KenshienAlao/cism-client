'use client';

import { ShoppingCart, X, Minus, Plus, Trash2, Store, Loader2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StalledCart } from '@/hooks/use-cart';
import Image from 'next/image';

interface CartItem {
    id: number;
    itemId: number;
    name: string;
    price: number;
    image: string;
    stallName: string;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    groups?: StalledCart[];
    isMutating?: boolean;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemoveItem: (id: number) => void;
    onCheckout: () => void;
}

function CartItemCard({
    item,
    currentQty,
    isStaged,
    isMutating,
    onUpdate,
    onRemove,
    onClick
}: {
    item: CartItem;
    currentQty: number;
    isStaged: boolean;
    isMutating?: boolean;
    onUpdate: (delta: number) => void;
    onRemove: () => void;
    onClick: () => void;
}) {
    return (
        <div className="group flex gap-2.5 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/5 transition-all">
            <div
                className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-neutral-100 shrink-0 cursor-pointer"
                onClick={onClick}
            >
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-300" />
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div className="space-y-0.5">
                    <div className="flex justify-between items-start gap-2">
                        <h3
                            className="text-[12px] sm:text-sm font-bold text-neutral-900 line-clamp-1 sm:line-clamp-2 leading-tight cursor-pointer hover:text-orange-500 transition-colors"
                            onClick={onClick}
                        >
                            {item.name}
                        </h3>
                        <button
                            onClick={onRemove}
                            className="text-neutral-300 hover:text-red-500 p-0.5 rounded-full transition-colors shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                    <p className="text-[9px] sm:text-xs font-semibold text-neutral-400 truncate uppercase tracking-wider">{item.stallName}</p>
                </div>

                <div className="flex items-center justify-between mt-1 sm:mt-3">
                    <p className="text-[13px] sm:text-sm font-black text-orange-500">
                        ₱{(item.price * currentQty).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-2 sm:gap-3 bg-neutral-50 rounded-full px-1 py-1 border border-neutral-100">
                        <button
                            onClick={() => onUpdate(-1)}
                            className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-neutral-600 active:scale-90 transition-all disabled:opacity-50"
                            disabled={isMutating}
                        >
                            <Minus className="w-2 h-2 sm:w-3 sm:h-3" strokeWidth={3} />
                        </button>
                        <span className={`w-3 sm:w-4 text-center text-[10px] sm:text-xs font-bold ${isStaged ? 'text-orange-500' : 'text-neutral-900'}`}>
                            {currentQty}
                        </span>
                        <button
                            onClick={() => onUpdate(1)}
                            className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-neutral-600 active:scale-90 transition-all disabled:opacity-50"
                        >
                            <Plus className="w-2 h-2 sm:w-3 sm:h-3" strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CartDrawer({
    isOpen,
    onClose,
    items,
    groups,
    isMutating,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout
}: CartDrawerProps) {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);
    const [stagedQuantities, setStagedQuantities] = useState<Record<number, number>>({});

    // Drag to close state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setDragOffset(0);
        } else {
            document.body.style.overflow = 'unset';
            setStagedQuantities({});
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const deltaY = Math.max(0, currentY - startY);
        setDragOffset(deltaY);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragOffset > 100) {
            onClose();
        } else {
            setDragOffset(0);
        }
    };

    const { subtotal, itemCount, hasChanges } = useMemo(() => {
        let sub = 0;
        let count = 0;
        items.forEach(item => {
            const qty = stagedQuantities[item.id] ?? item.quantity;
            sub += item.price * qty;
            count += qty;
        });
        return {
            subtotal: sub,
            itemCount: count,
            hasChanges: Object.keys(stagedQuantities).length > 0
        };
    }, [items, stagedQuantities]);

    const handleUpdateQuantity = (id: number, delta: number) => {
        const item = items.find(i => i.id === id);
        if (!item) return;

        const currentQty = stagedQuantities[id] ?? item.quantity;
        const newQty = Math.max(1, currentQty + delta);

        if (newQty === item.quantity) {
            const { [id]: _, ...rest } = stagedQuantities;
            setStagedQuantities(rest);
        } else {
            setStagedQuantities(prev => ({ ...prev, [id]: newQty }));
        }
    };

    const handleItemClick = (item: CartItem) => {
        onClose();
        const stallAccount = encodeURIComponent(item.stallName);
        const showQuery = encodeURIComponent(item.name);
        router.push(`/stall/item/show?a=${stallAccount}&id=${item.itemId}&q=${showQuery}`);
    };

    const handleSaveChanges = async () => {
        Object.entries(stagedQuantities).forEach(([id, qty]) => {
            onUpdateQuantity(Number(id), qty);
        });
        setStagedQuantities({});
    };

    if (!isOpen) return null; const drawerContent = (
        <div className="flex flex-col h-full font-sans relative bg-white sm:bg-neutral-50/30 overflow-hidden">
            {/* Mobile Drag Handle Area */}
            <div
                className="sm:hidden flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none bg-white sticky top-0 z-20"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="w-10 h-1 bg-neutral-200 rounded-full mb-2" />
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b border-black/5 bg-white sticky top-0 sm:top-0 z-10">
                <div className="flex flex-col">
                    <h2 className="text-base sm:text-xl font-black text-neutral-900 tracking-tight">Your Order</h2>
                    <p className="text-[10px] sm:text-sm font-bold text-neutral-400 uppercase tracking-widest">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="bg-neutral-100 text-neutral-500 hover:text-neutral-900 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-6 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-black/5 flex items-center justify-center mb-4 sm:mb-6">
                            <ShoppingCart className="w-6 h-6 sm:w-10 sm:h-10 text-neutral-200" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1">It's empty here</h3>
                        <p className="text-neutral-400 text-[10px] sm:text-xs font-medium max-w-[180px] leading-relaxed">Add something delicious!</p>
                    </div>
                ) : groups ? (
                    groups.map((group) => {
                        const groupSubtotal = group.items.reduce((sum, item) => {
                            const qty = stagedQuantities[item.id] ?? item.quantity;
                            return sum + item.price * qty;
                        }, 0);

                        return (
                            <div key={group.stallName} className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Store className="w-3 h-3 text-orange-500" />
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 truncate">{group.stallName}</h3>
                                    <div className="h-[1px] flex-1 bg-neutral-200/50 ml-1" />
                                </div>
                                <div className="space-y-2.5">
                                    {group.items.map(item => (
                                        <CartItemCard
                                            key={item.id}
                                            item={item as unknown as CartItem}
                                            currentQty={stagedQuantities[item.id] ?? item.quantity}
                                            isStaged={stagedQuantities[item.id] !== undefined}
                                            isMutating={isMutating}
                                            onUpdate={(delta) => handleUpdateQuantity(item.id, delta)}
                                            onRemove={() => {
                                                const { [item.id]: _, ...rest } = stagedQuantities;
                                                setStagedQuantities(rest);
                                                onRemoveItem(item.id);
                                            }}
                                            onClick={() => handleItemClick(item as unknown as CartItem)}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-end px-1">
                                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                                        Subtotal: <span className="text-neutral-600 ml-1">₱{groupSubtotal.toFixed(2)}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="space-y-2.5">
                        {items.map(item => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                currentQty={stagedQuantities[item.id] ?? item.quantity}
                                isStaged={stagedQuantities[item.id] !== undefined}
                                isMutating={isMutating}
                                onUpdate={(delta) => handleUpdateQuantity(item.id, delta)}
                                onRemove={() => {
                                    const { [item.id]: _, ...rest } = stagedQuantities;
                                    setStagedQuantities(rest);
                                    onRemoveItem(item.id);
                                }}
                                onClick={() => handleItemClick(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="bg-white border-t border-black/5 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] sticky bottom-0 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">Total</span>
                            <span className="text-xl sm:text-3xl font-black text-neutral-900 tracking-tighter">₱{subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {hasChanges ? (
                        <div className="flex gap-2 animate-in slide-in-from-bottom-3 duration-400">
                            <button
                                onClick={() => setStagedQuantities({})}
                                className="flex-1 bg-neutral-100 text-neutral-500 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isMutating}
                                className="flex-[2] bg-orange-500 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-lg shadow-orange-500/20"
                            >
                                {isMutating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onCheckout}
                            disabled={isMutating}
                            className="w-full bg-orange-500 text-white py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-2 group shadow-lg shadow-orange-500/20"
                        >
                            {isMutating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Check Out
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isOpen ? 'visible' : 'invisible'}`}>
            <div
                className={`absolute inset-0 bg-neutral-900/30 backdrop-blur-[2px] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            <div
                style={{
                    transform: isMobile && isOpen ? `translateY(${dragOffset}px)` : undefined,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
                }}
                className={`absolute shadow-2xl bg-white transition-all duration-500 ease-[cubic-bezier(0.32, 0.72, 0, 1)] flex flex-col 
                ${isMobile
                        ? `bottom-0 left-0 right-0 ${items.length > 0 ? 'h-[88vh]' : 'max-h-[88vh]'} rounded-t-[2rem] overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
                        : `top-0 bottom-0 right-0 w-full max-w-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
                    }`}
            >
                {drawerContent}
            </div>
        </div>
    );
}
