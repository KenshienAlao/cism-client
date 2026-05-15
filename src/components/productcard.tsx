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
            className="group block bg-white border border-neutral-100 rounded-md overflow-hidden active:border-orange-500/30 transition-colors"
        >
            <div className="relative aspect-square overflow-hidden">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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

            <div className="p-3 space-y-2.5">
                <div className="min-h-[2.5rem]">
                    <h3 className="text-[11px] font-bold text-neutral-900 line-clamp-2 leading-relaxed">{name}</h3>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar
                            src={stallImage}
                            name={stallName}
                            size="xs"
                            className="border border-neutral-100"
                        />
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate">{stallName}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                        <span className="text-[9px] font-bold text-neutral-900">{rating?.toFixed(1)}</span>
                    </div>
                </div>

                <div className="pt-1.5 border-t border-neutral-50">
                    <span className="text-[12px] font-bold text-orange-500 tracking-tight">
                        ₱{price.toFixed(2)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
