'use client'

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from 'react';
import { useItem } from "@/hooks/use-item";
import { ProductCard } from "@/components/productcard";
import { Inbox, ArrowLeft } from "lucide-react";
import Loading from "@/components/ui/loading";
function ItemSearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const { items, isLoading } = useItem();

    const allFlattenedItems = useMemo(() => {
        return items.flatMap(stall => {
            return stall.items.map(item => {
                const itemReviews = stall.reviews.filter(r => r.itemId === item.id);
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

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
                <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                    <div className="space-y-0.5 md:space-y-1">
                        <h1 className="text-2xl md:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                            {query ? `Results for "${query}"` : "All Items"}
                        </h1>
                        <p className="text-neutral-400 text-xs md:text-sm font-medium">
                            Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {filteredItems.map(({ item, stallImage }) => (
                            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                                <ProductCard
                                    item={item as any}
                                    image={item.image as string}
                                    stallImage={stallImage}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center text-center max-w-sm mx-auto px-4">
                        <Inbox className="w-12 h-12 text-neutral-200 mb-6" />
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">No items found</h2>
                        <p className="text-neutral-400 text-sm mb-10 leading-relaxed">
                            We couldn't find anything matching <span className="text-neutral-900 font-medium italic">"{query}"</span>
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-orange-500 text-sm font-black uppercase tracking-widest hover:text-orange-600 transition-colors"
                        >
                            Return to feed
                        </button>
                    </div>
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