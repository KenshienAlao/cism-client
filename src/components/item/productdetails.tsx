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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Image Section */}
            <div className="relative aspect-square bg-neutral-50 border border-neutral-100 overflow-hidden rounded-md">
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
                        <UtensilsCrossed className="w-10 h-10 text-neutral-200" />
                    </div>
                )}
                
                {/* Floating Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-neutral-100 text-xs font-medium shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                    <span>{itemDetails.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col">
                {/* Breadcrumb/Category */}
                <div className="mb-2">
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-orange-500">
                        {itemDetails.category}
                    </span>
                </div>

                <h1 className="text-3xl font-medium text-neutral-900 tracking-tight mb-2">
                    {itemDetails.name}
                </h1>

                {/* Seller Info */}
                <Link href={`/stall?name=${itemDetails.stallName}`} className="flex items-center gap-2 mb-6 group w-fit">
                    <Avatar
                        src={itemDetails.stallImage}
                        name={itemDetails.stallName}
                        size="sm"
                        className="h-5 w-5 grayscale group-hover:grayscale-0 transition-all"
                    />
                    <span className="text-sm text-neutral-500 group-hover:text-orange-500 flex items-center transition-colors">
                        {itemDetails.stallName}
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                </Link>

                {/* Price Display */}
                <div className="mb-8">
                    <span className="text-3xl font-light text-neutral-900">
                        ₱{displayPrice.toFixed(2)}
                    </span>
                    {variations.length > 0 && !selectedVariation && (
                        <span className="ml-2 text-xs text-neutral-400 uppercase tracking-tighter italic">Starting price</span>
                    )}
                </div>

                {/* Variations */}
                {variations.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Select Option</label>
                        <div className="flex flex-wrap gap-2">
                            {variations.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariation(v)}
                                    className={`px-4 py-2 text-xs font-medium border rounded transition-all duration-200 ${
                                        selectedVariation?.id === v.id
                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                    }`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Details Row */}
                <div className="flex gap-8 py-6 border-y border-neutral-100 mb-8">
                    <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-neutral-400" />
                        <div>
                            <p className="text-[10px] uppercase text-neutral-400 font-bold leading-none mb-1">Available</p>
                            <p className="text-sm font-medium">{displayStock}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-neutral-400" />
                        <div>
                            <p className="text-[10px] uppercase text-neutral-400 font-bold leading-none mb-1">Reviews</p>
                            <p className="text-sm font-medium">{itemDetails.reviewCount}</p>
                        </div>
                    </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        onClick={handleBuyNow}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-12 bg-orange-500 text-white hover:bg-orange-600 rounded shadow-none transition-colors order-1 sm:order-2"
                    >
                        Buy now
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleAddToCart}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="h-12 border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded shadow-none transition-colors order-2 sm:order-1 flex items-center justify-center gap-2"
                    >
                        {isMutating ? <Loader2 className="animate-spin h-4 w-4" /> : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                {displayStock === 0 ? 'Sold Out' : isAtLimit ? 'Max' : 'Add to Cart'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}