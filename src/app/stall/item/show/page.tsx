'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from 'react';
import { useItemDetail } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
            <div className="w-11 h-11 bg-secondary flex items-center justify-center mb-3 border border-border rounded-md">
                <ShoppingCart className="w-5 h-5 text-secondary-foreground/60" />
            </div>
            <h1 className="text-base font-medium mb-1">Item not found</h1>
            <p className="text-sm text-secondary-foreground/80 mb-5 max-w-xs leading-normal">
                This item may have been moved or is no longer available in {stallAccount}'s inventory.
            </p>
            <Button
                onClick={() => router.push('/')}
                className="h-10 px-4 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 active:scale-[0.98] focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md transition-all duration-150"
            >
                Return to Shop
            </Button>
        </div>
    );

    const hasReviewed = itemDetails.reviews.some(r => 
        (r.userId === profile?.user.id || r.users_id === profile?.user.id)
    );

    return (
        <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-150">
            <main className="max-w-6xl mx-auto px-4 py-5 md:py-10 space-y-10 md:space-y-14">
                
                {/* Product */}
                <div className="w-full">
                    <ProductDetails itemDetails={itemDetails} />
                </div>

                <hr className="border-border opacity-50" />
                <div className="max-w-3xl">
                    <section id="reviews" className="space-y-8">
                        <header className="space-y-1.5">
                            <h2 className="text-lg font-medium tracking-tight">Customer Reviews</h2>
                            <p className="text-xs text-muted-foreground">Feedback from recent purchases.</p>
                        </header>
                        
                        <div className="space-y-8">
                            {!hasReviewed ? (
                                <div className="bg-card p-6 border border-border rounded-xl shadow-sm">
                                    <WriteReviewForm
                                        stallId={itemDetails.stallId!}
                                        itemId={itemDetails.id!}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 bg-accent/50 text-accent-foreground p-5 border border-primary/20 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold leading-none">Review Submitted</p>
                                        <p className="text-xs opacity-80 leading-normal">
                                            You've already reviewed this item. Thank you for helping others with your feedback!
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-4">
                                <ProductRatings
                                    reviews={itemDetails.reviews}
                                    category={itemDetails.category}
                                />
                            </div>
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