import { Star } from 'lucide-react';
import { ItemResponse } from '@/model/product.model';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from './ui/avatar';

interface ProductCardProps {
    item: ItemResponse;
    image: string;
    stallImage?: string | null;
}

export function ProductCard({
    item,
    image,
    stallImage,
}: ProductCardProps) {
    const { id, name, price, stallName, rating, reviewCount, stock } = item;


    return (
        <Link
            href={`/stall/item/show?a=${encodeURIComponent(stallName || '')}&id=${id}&q=${encodeURIComponent(name)}`}
            className="group block bg-card rounded-[--radius] overflow-hidden shadow-sm transition-all duration-300 cursor-pointer border border-border hover:shadow-md hover:border-primary/20"
        >
            <div className="relative aspect-square overflow-hidden">
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
                    <Avatar
                        src={stallImage}
                        name={stallName}
                        size="xs"
                        className="ring-1 ring-black/10"
                    />
                    <p className="text-xs text-gray-500 truncate">{stallName}</p>
                </div>

                <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-primary">
                            Php {price.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
