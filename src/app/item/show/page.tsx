'use client'

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from 'react';
import { UtensilsCrossed, ArrowLeft, Star, MessageSquare, Package, ShoppingCart, Store, Heart } from 'lucide-react';
import Link from 'next/link';
import { useItem } from "@/hooks/use-item";
import { LoadingScreen } from "@/components/loadingscreen";
import Image from 'next/image';
import { Review, initReview } from "@/model/review.model";
import { createReviewSchema } from "@/validation/item.validation";
import { notifError, notifSuccess } from "@/lib/toast";

function ItemDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const { items, isLoading, createReview } = useItem();

    const [reviewForm, setReviewForm] = useState<Review>(initReview);

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

    const handleCreateReview = async (stallId: number | string, itemId: number | string) => {
        const valid = createReviewSchema.safeParse(reviewForm);
        if (!valid.success) {
            notifError(valid.error.issues[0].message)
            return
        }
        await createReview({
            itemId: Number(itemId),
            stallId: Number(stallId),
            star: reviewForm.star,
            comment: reviewForm.comment
        });
        setReviewForm(initReview);
    }

    if (isLoading) return <LoadingScreen />;

    if (!itemDetails) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-3xl font-black text-neutral-900 mb-5">Item not found</h1>
            <p className="text-neutral-400 mb-10 max-w-xs">We couldn't find the item you're looking for. It might have been moved.</p>
            <button
                onClick={() => router.push('/')}
                className="px-10 py-4 bg-orange-500 text-xs text-white font-black uppercase"
            >
                Return Home
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900">
            <header className="sticky top-0 z-50 bg-white border-b border-black/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-orange-500 transition-all active:scale-95"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="aspect-square bg-neutral-100 rounded-xl relative overflow-hidden border border-neutral-200">
                        {itemDetails.image ? (
                            <Image
                                src={itemDetails.image as string}
                                alt={itemDetails.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <UtensilsCrossed className="w-16 h-16 text-neutral-300" />
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-neutral-200 flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                                <span className="text-sm font-bold text-neutral-900">{itemDetails.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center space-y-6 py-4">
                        <div className="space-y-2">
                            <div className="text-orange-500 font-bold uppercase text-xs">
                                {itemDetails.category}
                            </div>
                            <h1 className="text-3xl md:text-4xl text-neutral-900">
                                {itemDetails.name}
                            </h1>
                            <div className="flex items-center gap-2 pt-3 text-sm font-medium text-neutral-500">
                                <Store className="w-4 h-4" />
                                <span className="font-bold text-neutral-900">{itemDetails.stallName}</span>
                            </div>
                        </div>

                        <div className="text-4xl font-black text-neutral-900">
                            ₱{itemDetails.price.toFixed(2)}
                        </div>

                        <div className="flex gap-8 border-y border-neutral-100 py-6">
                            <div className="space-y-1">
                                <div className="text-xs text-neutral-500 font-medium uppercase">Stock</div>
                                <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-orange-500" />
                                    {itemDetails.stocks} Units
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs text-neutral-500 font-medium uppercase">Reviews</div>
                                <div className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-orange-500" />
                                    {itemDetails.reviewCount} Ratings
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm uppercase">
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                            </button>
                            <button className="flex-1 bg-neutral-100 text-neutral-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors text-sm uppercase">
                                Buy now
                            </button>
                        </div>
                    </div>
                </div>

                <section className="mt-8 md:mt-12 bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
                    <h2 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wider">Write a Review</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-neutral-900">Rate this product:</span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none"
                                        onClick={() => setReviewForm(prev => ({ ...prev, star }))}
                                    >
                                        <Star
                                            className={`w-7 h-7 ${star <= reviewForm.star
                                                ? 'text-orange-500 fill-orange-500'
                                                : 'text-neutral-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Share your experience with this product..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[120px] resize-y"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleCreateReview(itemDetails.stallId!, itemDetails.id!)}
                                disabled={reviewForm.star === 0 || !reviewForm.comment?.trim()}
                                className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mt-6 bg-white rounded-xl border border-neutral-200 p-4 md:p-6 mb-12">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6 uppercase tracking-wider">Product Ratings</h2>

                    {itemDetails.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {itemDetails.reviews.map((review, index) => (
                                <div key={review.id} className={`flex gap-4 ${index !== itemDetails.reviews.length - 1 ? 'border-b border-neutral-100 pb-6' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-500 text-sm font-bold">
                                        {String.fromCharCode(65 + (review.userId! % 26))}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <div className="text-sm font-medium text-neutral-900">User_{review.userId}</div>
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${i < review.star ? 'fill-orange-500 text-orange-500' : 'fill-neutral-200 text-neutral-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-700 leading-relaxed">
                                            {review.comment}
                                        </p>
                                        <div className="text-xs text-neutral-400 mt-2">
                                            Variation: {itemDetails.category}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center justify-center">
                            <MessageSquare className="w-12 h-12 text-neutral-200 mb-3" />
                            <p className="text-sm text-neutral-500">No ratings yet</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default function ItemShowPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <ItemDetailContent />
        </Suspense>
    );
}