'use client';

import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Review } from "@/model/review.model";
import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils/formatDate';
import { Button } from "@/components/ui/button";

export function ProductRatings({ reviews }: { reviews: Review[], category?: string }) {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'media' | 5 | 4 | 3 | 2 | 1>('all');
    const [showAllReviews, setShowAllReviews] = useState(false);

    const counts = useMemo(() => {
        const c = { all: reviews.length, media: reviews.filter(r => r.image).length, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (r.star >= 1 && r.star <= 5) {
                c[r.star as 1 | 2 | 3 | 4 | 5]++;
            }
        });
        return c;
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        let result = reviews;
        if (selectedFilter === 'media') {
            result = reviews.filter(r => r.image);
        } else if (typeof selectedFilter === 'number') {
            result = reviews.filter(r => r.star === selectedFilter);
        }
        return result;
    }, [reviews, selectedFilter]);

    const avgRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.star, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    return (
        <section className="py-2">
            <div className="w-full">
                {/* Header Summary */}
                <div className="flex flex-col gap-4 mb-6 pb-5 border-b border-border">
                    <div className="space-y-1">
                        <h2 className="text-sm font-medium text-foreground tracking-tight">Verified Reviews</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-orange-500 text-orange-500' : 'fill-secondary-foreground/20 text-secondary-foreground/20'}`}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-secondary-foreground/70">
                                Based on <span className="font-semibold text-foreground">{reviews.length}</span> reviews
                            </span>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-1.5">
                        {(['all', 'media', 5, 4, 3, 2, 1] as const).map((id) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setSelectedFilter(id);
                                    setShowAllReviews(false);
                                }}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border focus:outline-none focus:ring-1 focus:ring-ring ${
                                    selectedFilter === id
                                        ? 'bg-accent border-orange-500 text-accent-foreground font-semibold'
                                        : 'bg-card border-border text-secondary-foreground/80 hover:border-secondary-foreground/30'
                                }`}
                            >
                                {id === 'all' ? 'All' : id === 'media' ? 'Photos' : `${id} ★`}
                                <span className="ml-1 opacity-60 text-[10px]">({counts[id]})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Feed List */}
                {filteredReviews.length > 0 ? (
                    <div className="space-y-5 divide-y divide-border/60">
                        {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)).map((review, index) => (
                            <div key={review.id || index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-3 items-start ${index > 0 ? 'pt-5' : ''}`}>
                                
                                {/* User Information */}
                                <div className="space-y-1.5 md:sticky md:top-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-md bg-secondary shrink-0 relative overflow-hidden border border-border">
                                            {review.user?.avatar ? (
                                                <Image
                                                    src={review.user.avatar as string}
                                                    alt={review.user.clientName || 'User'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="28px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-secondary-foreground/40 text-[10px] font-bold uppercase">
                                                    {review.user?.clientName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 leading-tight">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {review.user?.clientName || "Anonymous Buyer"}
                                            </p>
                                            <p className="text-[9px] text-secondary-foreground/60 uppercase tracking-tight">
                                                {formatDate(review.createdAt || review.create_at || review.createAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5 pl-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-2.5 h-2.5 ${i < review.star ? 'fill-orange-500 text-orange-500' : 'fill-secondary-foreground/15 text-secondary-foreground/15'}`}
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Comments & Uploaded Media Content */}
                                <div className="space-y-2.5 pl-0.5 md:pl-0">
                                    <p className="text-xs text-secondary-foreground/90 leading-relaxed max-w-2xl">
                                        {review.comment}
                                    </p>

                                    {review.image && (
                                        <div className="relative w-16 h-16 rounded-md border border-border overflow-hidden bg-secondary hover:border-secondary-foreground/30 transition-colors">
                                            <Image
                                                src={review.image}
                                                alt="Review content media"
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredReviews.length > 5 && !showAllReviews && (
                            <div className="pt-5">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(true)}
                                    className="h-9 text-xs font-medium text-secondary-foreground/80 border-border bg-background hover:bg-secondary hover:text-foreground transition-all px-5 rounded-md w-full sm:w-auto"
                                >
                                    Read all {filteredReviews.length} reviews
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center border border-dashed border-border rounded-lg bg-card/40">
                        <MessageSquare className="w-6 h-6 text-secondary-foreground/30 mx-auto mb-2" />
                        <p className="text-xs text-secondary-foreground/70">No reviews found for this selection.</p>
                    </div>
                )}
            </div>
        </section>
    );
}