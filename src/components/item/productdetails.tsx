'use client';

import { UtensilsCrossed, Star, Package, MessageSquare, ShoppingCart, Loader2, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useState, useMemo, useEffect } from 'react';
import { ItemVariation } from '@/model/item.model';
import { Avatar } from '../ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function ProductDetails({ itemDetails }: { itemDetails: any }) {
    const { cartItems, addToCart, isMutating } = useCart();
    const variations = useMemo(() => itemDetails.variations as ItemVariation[] || [], [itemDetails.variations]);
    const router = useRouter();

    const [selectedVariation, setSelectedVariation] = useState<ItemVariation | null>(null);

    useEffect(() => {
        if (variations.length > 0 && !selectedVariation) {
            setSelectedVariation([...variations].sort((a, b) => a.price - b.price)[0]);
        }
    }, [variations, selectedVariation]);

    const displayPrice = selectedVariation ? selectedVariation.price : itemDetails.price;
    const displayStock = useMemo(() => {
        if (selectedVariation) return Number(selectedVariation.stock) || Number((selectedVariation as any).stocks) || 0;
        if (variations.length > 0) return variations.reduce((acc, v) => acc + (Number(v.stock) || Number((v as any).stocks) || 0), 0);
        return Number(itemDetails.stocks) || Number(itemDetails.stock) || 0;
    }, [selectedVariation, variations, itemDetails.stocks, itemDetails.stock]);

    const displayName = selectedVariation ? `${itemDetails.name} (${selectedVariation.name})` : itemDetails.name;
    const displayImage = (selectedVariation?.image || itemDetails.image) as string;

    const cartItem = cartItems.find(i =>
        Number(i.itemId) === Number(itemDetails.id) &&
        (selectedVariation ? Number(i.variationId) === Number(selectedVariation.id) : !i.variationId)
    );
    const isAtLimit = cartItem && cartItem.quantity >= displayStock;

    const handleAddToCart = async () => {
        await addToCart({
            stallId: Number(itemDetails.stallId),
            stallItemId: Number(itemDetails.id),
            variationId: selectedVariation ? Number(selectedVariation.id) : 0,
            quantity: 1
        });
    };

    const handleBuyNow = () => {
        const params = new URLSearchParams({
            buyNow: 'true',
            stallId: String(itemDetails.stallId),
            itemId: String(itemDetails.id),
            variationId: selectedVariation ? String(selectedVariation.id) : '0',
            quantity: '1'
        });
        router.push(`/checkout?${params.toString()}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8 items-start">
            {/* Product Media Section */}
            <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-square w-full max-w-md mx-auto md:max-w-none md:mx-0 bg-secondary border border-border overflow-hidden rounded-md flex items-center justify-center"
            >
                {displayImage ? (
                    <Image 
                        src={displayImage} 
                        alt={displayName} 
                        fill 
                        className="object-cover" 
                        priority 
                        sizes="(max-width: 768px) 100vw, 40vw"
                    />
                ) : (
                    <span className="text-[15px] font-medium text-muted-foreground uppercase tracking-widest text-center leading-tight">
                        No<br/>Image
                    </span>
                )}
                
                {/* Rating */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-card text-card-foreground px-2 py-0.5 border border-border rounded-md text-xs font-medium">
                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span>{itemDetails.rating.toFixed(1)}</span>
                </div>
            </motion.div>

            {/* Product Details Section */}
            <div className="flex flex-col pt-1 md:pt-0">
                <span className="text-xs font-medium text-orange-500 mb-1">
                    {itemDetails.category}
                </span>

                <h1 className="text-md font-medium text-foreground tracking-tight mb-1.5">
                    {itemDetails.name}
                </h1>

                {/* Short vendor route context */}
                <Link href={`/stall?name=${itemDetails.stallName}`} className="flex items-center gap-1.5 mb-3 w-fit">
                    <Avatar
                        src={itemDetails.stallImage}
                        name={itemDetails.stallName}
                        size="sm"
                        className="h-4 w-4 rounded-md"
                    />
                    <span className="text-xs text-secondary-foreground hover:text-orange-500 flex items-center transition-colors">
                        {itemDetails.stallName}
                        <ChevronRight className="w-3 h-3 ml-0.5 opacity-60" />
                    </span>
                </Link>

                {/* Price Display */}
                <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-base md:text-lg font-semibold tracking-tight text-foreground">
                        ₱{displayPrice.toFixed(2)}
                    </span>
                </div>

                {/* Option Menu Layout */}
                {variations.length > 0 && (
                    <div className="mb-4 gap-2 flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-secondary-foreground tracking-wider">Select Option</label>
                        <div className="flex flex-wrap gap-1.5">
                            {variations.map((v) => {
                                const isSelected = selectedVariation?.id === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariation(v)}
                                        className={`relative px-2.5 py-1.5 text-xs font-medium border rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring ${
                                            isSelected
                                            ? 'border-orange-500 bg-accent text-accent-foreground'
                                            : 'border-border bg-card text-secondary-foreground hover:border-secondary-foreground/40'
                                        }`}
                                    >
                                        <span className="relative z-10">{v.name}</span>
                                        {isSelected && (
                                            <motion.span 
                                                layoutId="activeVariationIndicator"
                                                className="absolute inset-0 border border-orange-500 rounded-md pointer-events-none"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cart & Quantity Section */}
                <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-border mb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-secondary-foreground" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-secondary-foreground font-bold leading-none mb-0.5">Stocks</span>
                            <span className="text-xs font-medium text-foreground">{displayStock}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-secondary-foreground" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-secondary-foreground font-bold leading-none mb-0.5">Reviews</span>
                            <span className="text-xs font-medium text-foreground">{itemDetails.reviewCount}</span>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={handleAddToCart}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-9 border border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-500/20 rounded-md transition-colors flex items-center justify-center gap-1.5 text-xs font-medium focus:ring-1 focus:ring-orange-500/50"
                    >
                        {isMutating ? <Loader2 className="animate-spin h-3 w-3" /> : (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                {displayStock === 0 ? 'Sold Out' : isAtLimit ? 'Max Limit' : 'Add to Cart'}
                            </>
                        )}
                    </Button>
                    
                    <Button
                        onClick={handleBuyNow}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-9 bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] focus:ring-1 focus:ring-orange-500/50 rounded-md transition-all text-xs font-medium shadow-sm"
                    >
                        Buy Now
                    </Button>
                </div>
            </div>
        </div>
    );
}