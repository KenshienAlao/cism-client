import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { ItemResponse } from '@/model/product.model';
import Image from 'next/image';

interface ProductCardProps {
    item: ItemResponse;
    image: string;
    stallImage?: string | null;
    onAddToCart: (id: string) => void;
    onPreOrder?: (id: string) => void;
}

export function ProductCard({
    item,
    onAddToCart,
    onPreOrder,
    image,
    stallImage,
}: ProductCardProps) {
    const { id, name, price, stallName, rating, reviewCount, stock } = item;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="bg-card rounded-[--radius] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-border"
            style={{ transform: isHovered ? 'translateY(-4px)' : 'translateY(0)' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-square overflow-hidden bg-neutral-100">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-4 text-center">
                        <div className="space-y-1">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                Coming Soon
                            </span>
                        </div>
                    </div>
                )}
                {stock < 10 && stock > 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md">
                        Only {stock} left
                    </div>
                )}
                {stock === 0 && (
                    <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md">
                        Out of stock
                    </div>
                )}
            </div>

            <div className="p-3 space-y-2">
                <h3 className="text-sm line-clamp-2 min-h-[2.5rem]">{name}</h3>

                <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="font-medium">{rating?.toFixed(1)}</span>
                    <span className="text-gray-400">({reviewCount})</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {stallImage ? (
                        <Image
                            src={stallImage}
                            alt={stallName}
                            width={16}
                            height={16}
                            className="rounded-full object-cover shrink-0 ring-1 ring-black/10"
                        />
                    ) : (
                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 shrink-0 flex items-center justify-center">
                            <span className="text-[7px] font-black text-white leading-none">
                                {stallName?.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 truncate">{stallName}</p>
                </div>

                <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-primary">
                            Php {price.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    {onPreOrder && stock === 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreOrder(id);
                            }}
                            className="flex-1 meta-button rounded-[--radius] py-2.5 px-3 text-sm"
                        >
                            Pre-order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
