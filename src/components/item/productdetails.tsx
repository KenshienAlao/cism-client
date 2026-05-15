import { UtensilsCrossed, Star, Store, Package, MessageSquare, ShoppingCart, Check, Loader2 } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Product Image Section */}
            <div className="aspect-square bg-neutral-100 rounded-lg relative overflow-hidden border border-neutral-200">
                {displayImage ? (
                    <Image 
                        src={displayImage} 
                        alt={displayName} 
                        fill 
                        className="object-cover" 
                        priority 
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <UtensilsCrossed className="w-12 h-12 text-neutral-300" />
                    </div>
                )}
                <div className="absolute top-3 left-3">
                    <div className="bg-white/95 px-2.5 py-1 rounded-md shadow-sm border border-neutral-200 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span className="text-xs font-bold text-neutral-900">{itemDetails.rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col justify-center space-y-5 py-2">
                <div className="space-y-1">
                    <div className="text-orange-500 font-bold uppercase text-[10px] tracking-widest">{itemDetails.category}</div>
                    <h1 className="text-2xl md:text-3xl text-neutral-900 font-bold leading-tight">{itemDetails.name}</h1>
                    <Link href={`/stall?name=${itemDetails.stallName}`} className="flex items-center gap-2 mt-2 text-xs font-medium text-neutral-500 group">
                        <Avatar
                            src={itemDetails.stallImage}
                            name={itemDetails.stallName}
                            size="sm"
                            className="border border-neutral-100"
                        />
                        <span className="font-bold text-neutral-700 group-hover:text-orange-500 transition-colors">{itemDetails.stallName}</span>
                    </Link>
                </div>

                <div className="text-3xl font-bold text-neutral-900">
                    {variations.length > 0 && !selectedVariation && <span className="text-sm font-bold text-neutral-400 align-middle mr-2 uppercase">From</span>}
                    ₱{displayPrice.toFixed(2)}
                </div>

                {variations.length > 0 && (
                    <div className="space-y-3">
                        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Select Variation</div>
                        <div className="flex flex-wrap gap-2">
                            {variations.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariation(v)}
                                    className={`px-4 py-2 rounded-md text-xs font-bold border transition-colors ${selectedVariation?.id === v.id
                                        ? 'bg-orange-500 border-orange-500 text-white'
                                        : 'bg-white border-neutral-200 text-neutral-600'
                                        }`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-6 border-y border-neutral-100 py-5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-neutral-50 flex items-center justify-center border border-neutral-100">
                            <Package className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-[9px] text-neutral-400 font-bold uppercase">Stock</div>
                            <div className="text-xs font-bold text-neutral-900">{displayStock}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-neutral-50 flex items-center justify-center border border-neutral-100">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-[9px] text-neutral-400 font-bold uppercase">Reviews</div>
                            <div className="text-xs font-bold text-neutral-900">{itemDetails.reviewCount}</div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <Button
                        onClick={handleAddToCart}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="flex-1 bg-orange-500 text-white font-bold py-6 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-xs uppercase h-auto disabled:bg-neutral-100 disabled:text-neutral-300"
                    >
                        {isMutating ? <Loader2 className="animate-spin h-4 w-4" /> : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                {displayStock === 0 ? 'Out of Stock' : isAtLimit ? 'Max Reached' : 'Add to Cart'}
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="flex-1 bg-neutral-900 text-white font-bold py-6 rounded-md hover:bg-neutral-800 transition-colors text-xs uppercase h-auto disabled:opacity-30"
                    >
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    );
}

