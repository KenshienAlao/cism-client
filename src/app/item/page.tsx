'use client'

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from 'react';
import { motion } from "framer-motion";
import { useItem } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import { ProductCard } from "@/components/productcard";
import { Inbox } from "lucide-react";
import Loading from "@/components/ui/loading";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" } as const
    }
};

function ItemSearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const { profile, isLoading: isAuthLoading } = useAuth();
    const { items, isLoading } = useItem();
    
    const allFlattenedItems = useMemo(() => {
        if (!items) return [];
        return items.flatMap(stall => {
            return stall.items.map(item => {
                const itemReviews = stall.reviews.filter(r => r.itemId === item.id || r.stall_item_id === item.id);
                const avgRating = itemReviews.length > 0
                    ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
                    : 0;

                const variations = item.variations || [];
                const displayPrice = variations.length > 0
                    ? Math.min(...variations.map(v => v.price))
                    : item.price;
                const displayStock = variations.length > 0
                    ? variations.reduce((acc, v) => acc + (Number(v.stock) || Number((v as any).stocks) || 0), 0)
                    : (Number(item.stocks) || Number((item as any).stock) || 0);

                const itemData = {
                    ...item,
                    id: String(item.id),
                    stallId: stall.id,
                    name: item.name,
                    price: displayPrice,
                    image: item.image || "",
                    category: item.category,
                    stallName: stall.name,
                    rating: avgRating,
                    reviewCount: itemReviews.length,
                    stock: displayStock
                };

                return {
                    item: itemData,
                    stallImage: stall.image
                };
            });
        });
    }, [items]);

    const filteredItems = useMemo(() => {
        if (!query.trim()) return allFlattenedItems;
        const lowercaseQuery = query.toLowerCase();
        return allFlattenedItems.filter(({ item }) =>
            item.name.toLowerCase().includes(lowercaseQuery) ||
            item.category?.toLowerCase().includes(lowercaseQuery) ||
            item.stallName.toLowerCase().includes(lowercaseQuery)
        );
    }, [allFlattenedItems, query]);

    if (isAuthLoading || (isLoading && !allFlattenedItems.length)) return <Loading />;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased pb-16">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-10">
                {/* Header Section */}
                <div className="mb-6 md:mb-8 border-b border-border pb-4 md:pb-5">
                    <span className="text-xs font-medium text-orange-500 uppercase tracking-wider block mb-1">
                        Search Results
                    </span>
                    <div className="flex items-baseline justify-between gap-4">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                            {query || "Discovery"}
                        </h1>
                        <span className="text-xs text-secondary-foreground/60 shrink-0 font-medium">
                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>

                {/* Content Grid / Empty State */}
                {filteredItems.length > 0 ? (
                    <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredItems.map(({ item, stallImage }) => (
                            <motion.div 
                                key={item.id} 
                                className="w-full bg-card text-card-foreground border border-border rounded-lg overflow-hidden transition-colors"
                                variants={itemVariants}
                            >
                                <ProductCard
                                    item={item as any}
                                    image={item.image as string}
                                    stallImage={stallImage}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        className="py-16 md:py-24 flex flex-col items-center text-center bg-card border border-border rounded-lg p-5 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-md flex items-center justify-center border border-border mb-4">
                            <Inbox className="w-5 h-5 opacity-70" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight mb-1">No results found</h2>
                        <p className="text-xs text-secondary-foreground/70 max-w-[240px] leading-normal mb-5">
                            We couldn't find matches for &ldquo;{query}&rdquo;. Check spelling or try another term.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:scale-[0.98]"
                        >
                            Return to feed
                        </button>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <ItemSearchContent />
        </Suspense>
    );
}