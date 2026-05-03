'use client'

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from 'react';
import { useItem } from "@/hooks/use-item";
import Loading from "@/components/ui/loading";
import { ProductHeader } from "@/components/item/productheader";
import { ProductDetails } from "@/components/item/productdetails";
import { WriteReviewForm } from "@/components/item/writereviewform";
import { ProductRatings } from "@/components/item/productratings";
import { Button } from "@/components/ui/button";

function ItemDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const { items, isLoading, createReview } = useItem();

    const itemDetails = useMemo(() => {
        if (!id || !items.length) return null;

        for (const stall of items) {
            const foundItem = stall.items.find(i => String(i.id) === id);
            if (foundItem) {
                const itemReviews = stall.reviews.filter(r => r.itemId === foundItem.id);
                const avgRating = itemReviews.length > 0
                    ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
                    : 0;

                return {
                    ...foundItem,
                    stallId: stall.id,
                    stallName: stall.name,
                    stallImage: stall.image,
                    reviews: itemReviews,
                    rating: avgRating,
                    reviewCount: itemReviews.length
                };
            }
        }
        return null;
    }, [id, items]);

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
            <h1 className="text-3xl font-black text-neutral-900 mb-5">Item not found</h1>
            <p className="text-neutral-400 mb-10 max-w-xs">We couldn't find the item you're looking for. It might have been moved.</p>
            <Button
                onClick={() => router.push('/')}
                className="px-10 py-4 bg-orange-500 text-xs text-white font-black uppercase rounded-none hover:bg-orange-600"
            >
                Return Home
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            <ProductHeader />
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

export default function ItemShowPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ItemDetailContent />
        </Suspense>
    );
}