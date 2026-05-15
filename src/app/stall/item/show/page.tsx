'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from 'react';
import { useItemDetail } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, ArrowLeft, Star, CheckCircle2 } from "lucide-react";
import Loading from "@/components/ui/loading";
import { ProductDetails } from "@/components/item/productdetails";
import { WriteReviewForm } from "@/components/item/writereviewform";
import { ProductRatings } from "@/components/item/productratings";
import { Button } from "@/components/ui/button";

function StallItemDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile } = useAuth();

    const id = searchParams.get('id');
    const stallAccount = searchParams.get('a');
    const queryName = searchParams.get('q');

    const { data: itemDetails, isLoading } = useItemDetail(id, stallAccount, queryName);

    if (isLoading) return <Loading />;

    if (!itemDetails) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-neutral-50 flex items-center justify-center mb-4 border border-neutral-100">
                <ShoppingCart className="w-6 h-6 text-neutral-300" />
            </div>
            <h1 className="text-xl font-medium text-neutral-900 mb-2">Item not found</h1>
            <p className="text-sm text-neutral-500 mb-8 max-w-xs">
                This item may have been moved or is no longer available in {stallAccount}'s inventory.
            </p>
            <Button
                onClick={() => router.push('/')}
                className="h-11 px-6 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 rounded-md transition-colors"
            >
                Return to Shop
            </Button>
        </div>
    );

    const hasReviewed = itemDetails.reviews.some(r => 
        (r.userId === profile?.user.id || r.users_id === profile?.user.id)
    );

    return (
        <div className="min-h-screen bg-white text-neutral-900 antialiased">
            <main className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                <div className="mb-20">
                    <ProductDetails itemDetails={itemDetails} />
                </div>

                <hr className="border-neutral-100 mb-16" />

                {/* Review Section */}
                <div className="max-w-3xl">
                    <section id="reviews" className="space-y-12">
                        <header className="space-y-1">
                            <h2 className="text-2xl font-medium tracking-tight">Customer Reviews</h2>
                            <p className="text-sm text-neutral-500">Feedback from recent purchases.</p>
                        </header>
                        
                        <div className="grid gap-12">
                            {!hasReviewed ? (
                                <div className="bg-neutral-50/50 p-6 border border-neutral-100 rounded-lg">
                                    <WriteReviewForm
                                        stallId={itemDetails.stallId!}
                                        itemId={itemDetails.id!}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-orange-50/50 p-4 border border-orange-100 rounded-lg text-orange-700">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">You've already reviewed this item. Thank you for your feedback!</p>
                                </div>
                            )}
                            
                            <ProductRatings
                                reviews={itemDetails.reviews}
                                category={itemDetails.category}
                            />
                        </div>
                    </section>
                </div>
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