"use client";

import { Star, ChevronRight } from 'lucide-react';
import { ItemResponse } from '@/model/product.model';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from './ui/avatar';

interface ProductCardProps {
    item: ItemResponse;
    image: string;
    stallImage?: string | null;
    priority?: boolean;
}

export function ProductCard({
    item,
    image,
    stallImage,
    priority = false,
}: ProductCardProps) {
    const { id, name, price, stallName, rating, stock } = item;

    return (
        <Link
            href={`/stall/item/show?a=${encodeURIComponent(stallName || '')}&id=${id}&q=${encodeURIComponent(name)}`}
            className="group block bg-card border border-border rounded-md overflow-hidden transition-all duration-200 hover:border-primary/50 active:scale-[0.98]"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-secondary">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 40vw, 20vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center p-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            No Image
                        </span>
                    </div>
                )}

                {/* Stock Badges */}
                {stock < 10 && stock > 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        Low Stock
                    </div>
                )}
                {stock === 0 && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-foreground text-background text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">
                            Sold Out
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3">
                {/* Product Name */}
                <div className="mb-2 h-8">
                    <h3 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
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
                            className="w-4 h-4 border border-border grayscale-[0.2] group-hover:grayscale-0"
                        />
                        <p className="text-[10px] font-medium text-muted-foreground truncate tracking-tight">
                            {stallName?.toLowerCase()}
                        </p>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 bg-accent px-1 rounded-sm">
                        <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                        <span className="text-[10px] font-bold text-accent-foreground">
                            {rating > 0 ? rating.toFixed(1) : "—"}
                        </span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-bold text-foreground tracking-tight">
                        ₱{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    
                    <div className="w-5 h-5 rounded-sm border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                        <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground" />
                    </div>
                </div>
            </div>
        </Link>
    );
}