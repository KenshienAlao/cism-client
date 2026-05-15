"use client";

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
            className="group block bg-white border border-neutral-200/60 rounded-lg overflow-hidden transition-all duration-200 hover:border-orange-500/40 hover:shadow-sm active:scale-[0.98]"
        >
            <div className="relative aspect-square overflow-hidden bg-neutral-50">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 40vw, 20vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center p-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300">
                            No Image
                        </span>
                    </div>
                )}

                {stock < 10 && stock > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                        Low Stock
                    </div>
                )}
                {stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-neutral-900 text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                            Sold Out
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3">
                {/* Product Name */}
                <div className="mb-2 h-8">
                    <h3 className="text-[11px] font-semibold text-neutral-800 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                        {name}
                    </h3>
                </div>

                {/* Stall & Rating Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar
                            src={stallImage}
                            name={stallName}
                            size="xs"
                            className="w-4 h-4 border border-neutral-100 grayscale-[0.5] group-hover:grayscale-0"
                        />
                        <p className="text-[10px] font-medium text-neutral-500 truncate lowercase tracking-tight">
                            {stallName}
                        </p>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 bg-neutral-50 px-1 rounded">
                        <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                        <span className="text-[10px] font-bold text-neutral-700">
                            {rating > 0 ? rating.toFixed(1) : "—"}
                        </span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                    <span className="text-sm font-bold text-neutral-900 tracking-tight">
                        ₱{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    
                    <div className="w-5 h-5 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors">
                        <ChevronRight className="w-3 h-3 text-neutral-300 group-hover:text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}


import { ChevronRight } from 'lucide-react';