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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
            {/* Image Section */}
            <div className="relative aspect-square bg-secondary border border-border overflow-hidden rounded-lg">
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
                    <div className="flex h-full w-full items-center justify-center">
                        <UtensilsCrossed className="w-8 h-8 text-secondary-foreground/40" />
                    </div>
                )}
                
                {/* Rating */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-card text-card-foreground px-2 py-0.5 border border-border rounded-md text-xs font-medium">
                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                    <span>{itemDetails.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col pt-1 md:pt-0">
                {/* Category tag */}
                <span className="text-[10px] tracking-wider uppercase font-semibold text-orange-500 mb-1">
                    {itemDetails.category}
                </span>

                <h1 className="text-xl md:text-2xl font-medium text-foreground tracking-tight mb-1.5">
                    {itemDetails.name}
                </h1>

                {/* Seller Info */}
                <Link href={`/stall?name=${itemDetails.stallName}`} className="flex items-center gap-1.5 mb-5 group w-fit">
                    <Avatar
                        src={itemDetails.stallImage}
                        name={itemDetails.stallName}
                        size="sm"
                        className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs text-secondary-foreground/80 group-hover:text-orange-500 flex items-center transition-colors">
                        {itemDetails.stallName}
                        <ChevronRight className="w-3 h-3 ml-0.5 opacity-60" />
                    </span>
                </Link>

                {/* Price Display */}
                <div className="mb-5 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                        ₱ {displayPrice.toFixed(2)}
                    </span>
                    {variations.length > 0 && !selectedVariation && (
                        <span className="text-[11px] text-secondary-foreground/60 uppercase tracking-tight italic">Starting price</span>
                    )}
                </div>

                {/* Variations Options Selector */}
                {variations.length > 0 && (
                    <div className="mb-5 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-secondary-foreground/60 tracking-wider">Select Option</label>
                        <div className="flex flex-wrap gap-2">
                            {variations.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariation(v)}
                                    className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-ring ${
                                        selectedVariation?.id === v.id
                                        ? 'border-orange-500 bg-accent text-accent-foreground'
                                        : 'border-border bg-card text-secondary-foreground/90 hover:border-secondary-foreground/30'
                                    }`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Row */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-border mb-5">
                    <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-secondary-foreground/60" />
                        <div>
                            <p className="text-[10px] uppercase text-secondary-foreground/50 font-bold leading-none mb-0.5">Stocks</p>
                            <p className="text-sm font-medium text-foreground">{displayStock}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-secondary-foreground/60" />
                        <div>
                            <p className="text-[10px] uppercase text-secondary-foreground/50 font-bold leading-none mb-0.5">Reviews</p>
                            <p className="text-sm font-medium text-foreground">{itemDetails.reviewCount}</p>
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={handleAddToCart}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-10 border-border bg-background text-foreground hover:bg-secondary rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        {isMutating ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : (
                            <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                {displayStock === 0 ? 'Sold Out' : isAtLimit ? 'Max' : 'Add to Cart'}
                            </>
                        )}
                    </Button>
                    
                    <Button
                        onClick={handleBuyNow}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-10 bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] focus:ring-1 focus:ring-ring rounded-md transition-all text-sm font-medium"
                    >
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    );
}