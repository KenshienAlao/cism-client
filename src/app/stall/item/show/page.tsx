'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from 'react';
import { useItem } from "@/hooks/use-item";
import { ShoppingCart } from "lucide-react";
import Loading from "@/components/ui/loading";
import { ProductDetails } from "@/components/item/productdetails";
import { WriteReviewForm } from "@/components/item/writereviewform";
import { ProductRatings } from "@/components/item/productratings";
import { Button } from "@/components/ui/button";

function StallItemDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = searchParams.get('id');
    const stallAccount = searchParams.get('a'); // Stall Name
    const query = searchParams.get('q'); // Item Name 

    const { items, isLoading, createReview } = useItem();

    const itemDetails = useMemo(() => {
        if (!items.length) return null;

        let foundItemData = null;

        if (id) {
            for (const stall of items) {
                if (stallAccount && stall.name.toLowerCase() !== stallAccount.toLowerCase()) continue;

                const item = stall.items.find(i => String(i.id) === id);
                if (item) {
                    foundItemData = { item, stall };
                    break;
                }
            }
        }

        if (!foundItemData && stallAccount && query) {
            const stall = items.find(s => s.name.toLowerCase() === stallAccount.toLowerCase());
            if (stall) {
                const item = stall.items.find(i => i.name.toLowerCase() === query.toLowerCase());
                if (item) {
                    foundItemData = { item, stall };
                }
            }
        }

        if (!foundItemData && id) {
            for (const stall of items) {
                const item = stall.items.find(i => String(i.id) === id);
                if (item) {
                    foundItemData = { item, stall };
                    break;
                }
            }
        }

        if (foundItemData) {
            const { item, stall } = foundItemData;
            const itemReviews = stall.reviews.filter(r => r.itemId === item.id);
            const avgRating = itemReviews.length > 0
                ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
                : 0;

            return {
                ...item,
                stallId: stall.id,
                stallName: stall.name,
                stallImage: stall.image,
                reviews: itemReviews,
                rating: avgRating,
                reviewCount: itemReviews.length,
                category: item.category || 'Uncategorized'
            };
        }

        return null;
    }, [id, stallAccount, query, items]);

    const handleCreateReview = async (stallId: number, itemId: number, star: number, comment: string) => {
        await createReview({
            itemId: Number(itemId),
            stallId: Number(stallId),
            star: star,
            comment: comment
        });
    }

    if (isLoading) return <Loading />;

    if (!itemDetails) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-8 h-8 text-neutral-200" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 mb-3">Item Not Found</h1>
            <p className="text-neutral-400 mb-10 max-w-xs mx-auto">We couldn't find the specific item from {stallAccount || 'this stall'}. It may have been removed or renamed.</p>
            <Button
                onClick={() => router.push('/')}
                className="px-8 py-4 bg-orange-500 text-xs text-white font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
                Start Browsing
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-16">
                <ProductDetails itemDetails={itemDetails} />
                <WriteReviewForm
                    stallId={itemDetails.stallId!}
                    itemId={itemDetails.id!}
                    onCreateReview={handleCreateReview}
                />
                <ProductRatings
                    reviews={itemDetails.reviews}
                    category={itemDetails.category}
                />
            </main>
        </div>
    );
}

export default function StallItemShowPage() {
    return (
        <Suspense fallback={<Loading />}>
            <StallItemDetailContent />
        </Suspense>
    );
}
