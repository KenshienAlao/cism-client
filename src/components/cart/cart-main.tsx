import { ShoppingCart, ArrowRight, Store, Trash2, Minus, Plus, Check, Loader2, AlertCircle, Inbox } from 'lucide-react';
import Image from 'next/image';



export interface CartSummary {
    totalItems: number;
    totalPrice: number;
    validItems: Set<number>;
    invalidItems: Set<number>;
}

export interface CartItem {
    id: number;
    itemId: number;
    variationId?: number | null;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    variationName?: string | null;
}

export interface StalledCart {
    stallName: string;
    items: CartItem[];
}

export interface CartMainProps {
    stalledItems: StalledCart[];
    selectedIds: Set<number>;
    stagedQuantities: Record<number, number>;
    getStock: (itemId: number, variationId?: number | null) => number;
    cartSummary: { invalidItems: Set<number>; count?: number; subtotal?: number; hasChanges?: boolean; hasStockIssues?: boolean };
    toggleItem: (id: number) => void;
    removeItem: (id: number) => void;
    handleUpdateQuantity: (id: number, delta: number) => void;
    toggleGroup: (ids: number[]) => void;
}

export default function CartMain({stalledItems, selectedIds, stagedQuantities, getStock, cartSummary, toggleItem, removeItem, handleUpdateQuantity, toggleGroup}: CartMainProps) {
    return (
        <div className="space-y-12">
            {stalledItems.map((group) => {
                const groupItemIds = group.items.map((i: any) => i.id);
                const allGroupSelected = groupItemIds.every((id: number) => selectedIds.has(id));

                return (
                    <div key={group.stallName} className="space-y-6">
                        {/* Group Header */}
                        <div className="flex items-center gap-4 cursor-pointer group/header" onClick={() => toggleGroup(groupItemIds)}>
                            <div className={`shrink-0 w-6 h-6 border flex items-center justify-center ${allGroupSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-300'}`}>
                                {allGroupSelected && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Store className="w-4 h-4 text-orange-500" />
                                <h3 className="text-[11px] md:text-xs font-black uppercase tracking-[0.25em] text-neutral-900">{group.stallName}</h3>
                            </div>
                            <div className="h-px flex-1 bg-neutral-200" />
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            {group.items.map((item: any) => {
                                const qty = stagedQuantities[item.id] ?? item.quantity;
                                const isSelected = selectedIds.has(item.id);
                                const maxStock = getStock(item.itemId, item.variationId);
                                const hasStockIssue = cartSummary.invalidItems.has(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative flex gap-3 md:gap-6 bg-white p-3 md:p-6 border transition-none ${isSelected ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200'}`}
                                    >
                                        {/* Selection Checkbox */}
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className={`shrink-0 self-center w-6 h-6 md:w-8 md:h-8 border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-neutral-300'}`}
                                        >
                                            {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={4} />}
                                        </button>

                                        {/* Product Image */}
                                        <div className="relative w-20 h-20 md:w-32 md:h-32 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover grayscale-[0.2]" sizes="(max-width: 768px) 80px, 128px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                                                    <Inbox className="w-8 h-8 text-neutral-200" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm md:text-xl font-black text-neutral-900 truncate leading-tight uppercase tracking-tight">{item.name}</h3>
                                                    {hasStockIssue ? (
                                                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">
                                                            <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                                            Only {maxStock} left in stock
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">
                                                            {item.variationName || 'Original'}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-neutral-400 hover:text-rose-500 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>
                                            </div>

                                            <div className="flex items-end justify-between gap-4 mt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Price</span>
                                                    <p className="text-base md:text-2xl font-black text-orange-500 tracking-tighter leading-none">
                                                        ₱{(item.price * qty).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>

                                                {/* Quantity Selector */}
                                                <div className="flex items-center bg-neutral-100 p-1 border border-neutral-200">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, -1)}
                                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-900 disabled:opacity-20"
                                                        disabled={qty <= 1}
                                                    >
                                                        <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} />
                                                    </button>
                                                    <span className={`w-8 md:w-12 text-center text-xs md:text-sm font-black tabular-nums ${stagedQuantities[item.id] !== undefined ? 'text-orange-500' : 'text-neutral-900'}`}>
                                                        {qty}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, 1)}
                                                        disabled={qty >= maxStock}
                                                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-900 disabled:opacity-20"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} />
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
        </div>
    );
}