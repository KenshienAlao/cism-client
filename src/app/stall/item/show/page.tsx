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
import { motion, AnimatePresence } from "framer-motion";

// Clean, subtle Framer Motion configurations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2, staggerChildren: 0.03 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 6},
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.2, ease: "easeOut" as const }
    }
};

function StallItemDetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile, isLoading: isAuthLoading } = useAuth();

    const id = searchParams.get('id');
    const stallAccount = searchParams.get('a');
    const queryName = searchParams.get('q');

    const { data: itemDetails, isLoading } = useItemDetail(id, stallAccount, queryName);

    if (isAuthLoading || isLoading) return <Loading />;

    if (!itemDetails) return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center p-5 bg-card border border-border rounded-lg max-w-[320px]"
            >
                <div className="w-9 h-9 bg-secondary flex items-center justify-center mb-3 border border-border rounded-md">
                    <ShoppingCart className="w-4 h-4 text-secondary-foreground" />
                </div>
                <h1 className="text-sm font-medium mb-1">Item not found</h1>
                <p className="text-xs text-secondary-foreground mb-4 leading-normal">
                    This item may have been moved or is no longer available in {stallAccount || 'the store'}'s inventory.
                </p>
                <Button
                    onClick={() => router.push('/')}
                    className="w-full h-9 bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 active:scale-[0.98] focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background rounded-md transition-all duration-150"
                >
                    Return to Shop
                </Button>
            </motion.div>
        </div>
    );

    const hasReviewed = itemDetails.reviews.some(r => 
        (r.userId === profile?.user.id || r.users_id === profile?.user.id)
    );

    return (
        <div className="min-h-screen bg-background text-foreground antialiased transition-colors duration-150 selection:bg-orange-500/20">
            <motion.main 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-4 py-4 md:py-10 gap-8 md:gap-12 flex flex-col"
            >
                <motion.div variants={itemVariants} className="w-full">
                    <ProductDetails itemDetails={itemDetails} />
                </motion.div>

                <hr className="border-border" />

                {/* Review Section */}
                <motion.div variants={itemVariants} className="w-full max-w-4xl">
                    <section id="reviews" className="gap-5 flex flex-col">
                        <header className="gap-1 flex flex-col">
                            <h2 className="text-base font-medium tracking-tight">Customer Reviews</h2>
                            <p className="text-xs text-secondary-foreground">Feedback from recent purchases.</p>
                        </header>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                            {/* Review Creation Input */}
                            <div className="md:col-span-5 w-full">
                                <AnimatePresence mode="wait">
                                    {!hasReviewed ? (
                                        <motion.div 
                                            key="review-form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-card p-4 border border-border rounded-lg"
                                        >
                                            <WriteReviewForm
                                                stallId={itemDetails.stallId!}
                                                itemId={itemDetails.id!}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="review-submitted"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-3 bg-secondary p-4 border border-border rounded-lg"
                                        >
                                            <CheckCircle2 className="w-4 h-4 shrink-0 text-orange-500 mt-0.5" />
                                            <div className="gap-1 flex flex-col">
                                                <p className="text-xs font-medium leading-none">Review Submitted</p>
                                                <p className="text-xs text-secondary-foreground leading-normal">
                                                    You've already provided your feedback for this item.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        
                            <div className="md:col-span-7 w-full">
                                <ProductRatings
                                    reviews={itemDetails.reviews}
                                    category={itemDetails.category}
                                />
                            </div>
                        </div>
                    </section>
                </motion.div>
            </motion.main>
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