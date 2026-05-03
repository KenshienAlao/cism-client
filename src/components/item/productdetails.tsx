import { UtensilsCrossed, Star, Store, Package, MessageSquare, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export function ProductDetails({ itemDetails }: { itemDetails: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-neutral-100 rounded-xl relative overflow-hidden border border-neutral-200">
                {itemDetails.image ? (
                    <Image src={itemDetails.image as string} alt={itemDetails.name} fill className="object-cover" priority />
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
                    <h1 className="text-3xl md:text-4xl text-neutral-900">{itemDetails.name}</h1>
                    <div className="flex items-center gap-2 pt-3 text-sm font-medium text-neutral-500">
                        <Store className="w-4 h-4" />
                        <span className="font-bold text-neutral-900">{itemDetails.stallName}</span>
                    </div>
                </div>

                <div className="text-4xl font-black text-neutral-900">₱{itemDetails.price.toFixed(2)}</div>

                <div className="flex gap-8 border-y border-neutral-100 py-6">
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 font-medium uppercase">Stock</div>
                        <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                            <Package className="w-4 h-4 text-orange-500" />
                            {itemDetails.stocks} Units
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-neutral-500 font-medium uppercase">Reviews</div>
                        <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            {itemDetails.reviewCount} Ratings
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm uppercase h-auto">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </Button>
                    <Button className="flex-1 bg-neutral-100 text-neutral-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors text-sm uppercase h-auto">
                        Buy now
                    </Button>
                </div>
            </div>
        </div>
    );
}
