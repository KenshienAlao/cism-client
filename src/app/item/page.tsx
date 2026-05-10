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
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans pb-32">
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-16">
                <div className="mb-10 md:mb-16">
                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em] block mb-1">Search Results</span>
                    <div className="flex items-baseline justify-between gap-4">
                        <h1 className="text-xl md:text-3xl font-bold text-neutral-900 uppercase tracking-tight truncate">
                            {query || "Discovery"}
                        </h1>
                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest shrink-0">
                            {filteredItems.length} items
                        </span>
                    </div>
                    <div className="h-0.5 w-12 bg-orange-500 mt-5" />
                </div>

                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {filteredItems.map(({ item, stallImage }) => (
                            <div key={item.id} className="w-full">
                                <ProductCard
                                    item={item as any}
                                    image={item.image as string}
                                    stallImage={stallImage}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center text-center bg-white border border-neutral-100 rounded-md px-6">
                        <div className="w-12 h-12 bg-neutral-50 rounded-md flex items-center justify-center border border-neutral-100 mb-5">
                            <Inbox className="w-5 h-5 text-neutral-200" />
                        </div>
                        <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1">No results</h2>
                        <p className="text-[10px] font-medium text-neutral-400 max-w-[200px] leading-relaxed mb-8">
                            We couldn't find any items matching "{query}"
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-[10px] font-bold text-orange-500 uppercase tracking-widest active:text-orange-600 transition-colors"
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