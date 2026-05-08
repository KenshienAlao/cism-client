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

    const handleBuyNow = async () => {
        await addToCart({
            stallId: Number(itemDetails.stallId),
            stallItemId: Number(itemDetails.id),
            variationId: selectedVariation ? Number(selectedVariation.id) : 0,
            quantity: 1
        });
        router.push('/checkout');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-neutral-100 rounded-xl relative overflow-hidden border border-neutral-200">
                {displayImage ? (
                    <Image src={displayImage} alt={displayName} fill className="object-cover transition-all duration-300" priority />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <UtensilsCrossed className="w-16 h-16 text-neutral-300" />
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-neutral-200 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                        <span className="text-sm font-bold text-neutral-900">{itemDetails.rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center space-y-6 py-4">
                <div className="space-y-2">
                    <div className="text-orange-500 font-bold uppercase text-xs">{itemDetails.category}</div>
                    <h1 className="text-3xl md:text-4xl text-neutral-900 font-bold tracking-tight">{itemDetails.name}</h1>
                    <Link href={`/stall?name=${itemDetails.stallName}`} className="flex items-center gap-2 pt-1 text-sm font-medium text-neutral-500 group">
                        <Avatar
                            src={itemDetails.stallImage}
                            name={itemDetails.stallName}
                            size="sm"
                            className="group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="font-bold text-neutral-900 group-hover:text-orange-500 transition-colors">{itemDetails.stallName}</span>
                    </Link>
                </div>

                <div className="text-4xl font-black text-neutral-900">
                    {variations.length > 0 && !selectedVariation && <span className="text-lg font-bold text-neutral-400 align-middle mr-2 uppercase">Starting at</span>}
                    ₱{displayPrice.toFixed(2)}
                </div>

                {variations.length > 0 && (
                    <div className="space-y-3">
                        <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Select Variation</div>
                        <div className="flex flex-wrap gap-2">
                            {variations.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariation(v)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${selectedVariation?.id === v.id
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-orange-500 hover:text-orange-500'
                                        }`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-8 border-y border-neutral-100 py-6">
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 font-medium uppercase">Stock</div>
                        <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-orange-500" />
                            {displayStock}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 font-medium uppercase">Reviews</div>
                        <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            {itemDetails.reviewCount}
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleAddToCart}
                        disabled={displayStock === 0 || isAtLimit || isMutating}
                        className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm uppercase h-auto disabled:bg-neutral-200 disabled:text-neutral-400"
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
                        className="flex-1 bg-neutral-100 text-neutral-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors text-sm uppercase h-auto disabled:opacity-50"
                    >
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    );
}

