"use client";

import { Star, ChevronRight } from 'lucide-react';
import { ItemResponse } from '@/model/product.model';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar } from './ui/avatar';
import { motion } from 'framer-motion';

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
            className="group block bg-card border border-border rounded-lg overflow-hidden transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-ring"
        >
            <div className="relative aspect-square overflow-hidden bg-secondary select-none">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        sizes="(max-width: 320px) 140px, (max-width: 768px) 160px, 190px"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center p-2">
                        <span className="text-[10px] font-medium tracking-tight text-secondary-foreground/50">
                            No image
                        </span>
                    </div>
                )}
                {stock < 10 && stock > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                        Low stock
                    </div>
                )}
                {stock === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="bg-secondary text-secondary-foreground border border-border text-[10px] font-medium px-2 py-0.5 rounded-md">
                            Sold out
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col gap-2">
                <div className="h-7">
                    <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                        {name}
                    </h3>
                </div>
                <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 min-w-0">
                        <Avatar
                            src={stallImage}
                            name={stallName}
                            size="xs"
                            className="w-3.5 h-3.5 border border-border shrink-0"
                        />
                        <p className="text-[11px] text-secondary-foreground/80 truncate tracking-tight">
                            {stallName}
                        </p>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 bg-secondary px-1 py-0.5 rounded-md border border-border/40">
                        <Star className="w-2.5 h-2.5 fill-orange-500 text-orange-500" />
                        <span className="text-[10px] font-semibold text-foreground">
                            {rating > 0 ? rating.toFixed(1) : "—"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border mt-0.5">
                    <span className="text-xs font-bold text-foreground tracking-tight">
                        ₱{price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    
                    <motion.div 
                        whileTap={{ scale: 0.92 }}
                        className="w-4.5 h-4.5 rounded-md bg-secondary border border-border flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors"
                    >
                        <ChevronRight className="w-3 h-3 text-secondary-foreground/70 group-hover:text-white transition-colors" />
                    </motion.div>
                </div>
            </div>
        </Link>
    );
}