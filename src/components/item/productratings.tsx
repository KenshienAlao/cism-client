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
        <div className="w-full">
            {/* Header Summary & Filters Block */}
            <div className="bg-card border border-border p-4 rounded-lg gap-4 flex flex-col mb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-secondary-foreground tracking-wider mb-0.5">Rating Summary</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-semibold tracking-tight text-foreground">{avgRating}</span>
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3 h-3 ${i < Math.round(Number(avgRating)) ? 'fill-orange-500 text-orange-500' : 'fill-secondary-foreground/20 text-secondary-foreground/20'}`}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-secondary-foreground">
                        <span className="font-medium text-foreground">{reviews.length}</span> verified checkouts
                    </span>
                </div>

                {/* Filter Horizontal Row */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
                    {(['all', 'media', 5, 4, 3, 2, 1] as const).map((id) => (
                        <button
                            key={id}
                            onClick={() => {
                                setSelectedFilter(id);
                                setShowAllReviews(false);
                            }}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border focus:outline-none focus:ring-1 focus:ring-ring ${
                                selectedFilter === id
                                    ? 'bg-accent border-orange-500 text-accent-foreground'
                                    : 'bg-background border-border text-secondary-foreground hover:border-secondary-foreground/40'
                            }`}
                        >
                            {id === 'all' ? 'All' : id === 'media' ? 'Photos' : `${id} ★`}
                            <span className="ml-1 opacity-60 text-[10px]">({counts[id]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Compact Review Feed List */}
            {filteredReviews.length > 0 ? (
                <div className="gap-3 flex flex-col">
                    {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)).map((review, index) => (
                        <div 
                            key={review.id || index} 
                            className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2.5"
                        >
                            {/* User Header Block */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-6 h-6 rounded-md bg-secondary shrink-0 relative overflow-hidden border border-border">
                                        {review.user?.avatar ? (
                                            <Image
                                                src={review.user.avatar as string}
                                                alt={review.user.clientName || 'User'}
                                                fill
                                                className="object-cover"
                                                sizes="24px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-secondary-foreground/40 text-[9px] font-bold uppercase">
                                                {review.user?.clientName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 leading-tight">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {review.user?.clientName || "Anonymous Buyer"}
                                        </p>
                                        <p className="text-[10px] text-secondary-foreground">
                                            {formatDate(review.createdAt || review.create_at || review.createAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-0.5 shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-2.5 h-2.5 ${i < review.star ? 'fill-orange-500 text-orange-500' : 'fill-secondary-foreground/15 text-secondary-foreground/15'}`}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Short Text Content */}
                            <p className="text-xs text-foreground/90 leading-relaxed wrap-break-word">
                                {review.comment}
                            </p>

                            {/* Small Avatar Thumbnail */}
                            {review.image && (
                                <div className="relative w-12 h-12 rounded-md border border-border overflow-hidden bg-secondary">
                                    <Image
                                        src={review.image}
                                        alt="Review content media"
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination Action Control */}
                    {filteredReviews.length > 5 && !showAllReviews && (
                        <div className="pt-1">
                            <Button
                                variant="outline"
                                onClick={() => setShowAllReviews(true)}
                                className="h-9 text-xs font-medium text-foreground border-border bg-card hover:bg-secondary transition-colors px-4 rounded-md w-full focus:ring-1 focus:ring-ring"
                            >
                                Read all {filteredReviews.length} reviews
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center border border-border rounded-lg bg-card">
                    <MessageSquare className="w-5 h-5 text-secondary-foreground/40 mx-auto mb-1.5" />
                    <p className="text-xs text-secondary-foreground">No matching reviews found.</p>
                </div>
            )}
        </div>
    );
}