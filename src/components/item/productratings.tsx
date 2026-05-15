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
        <section className="py-12 border-t border-neutral-100">
            <div className="max-w-4xl">
                {/* Header Summary */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h2 className="text-xl font-medium text-neutral-900 tracking-tight">Verified Reviews</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-orange-500 text-orange-500' : 'fill-neutral-100 text-neutral-100'}`}
                                        strokeWidth={1.5}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-neutral-500">
                                Based on <span className="font-medium text-neutral-900">{reviews.length}</span> reviews
                            </span>
                        </div>
                    </div>

                    {/* Minimalist Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'media', 5, 4, 3, 2, 1] as const).map((id) => (
                            <button
                                key={id}
                                onClick={() => setSelectedFilter(id)}
                                className={`px-3 py-1.5 rounded text-[11px] font-medium transition-all border ${
                                    selectedFilter === id
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                                }`}
                            >
                                {id === 'all' ? 'All' : id === 'media' ? 'Photos' : `${id} ★`}
                                <span className={`ml-1.5 opacity-60`}>({counts[id]})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {filteredReviews.length > 0 ? (
                    <div className="space-y-10">
                        {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)).map((review, index) => (
                            <div key={review.id || index} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-8 group">
                                {/* Left Side: User Meta */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-neutral-50 flex-shrink-0 relative overflow-hidden border border-neutral-100">
                                            {review.user?.avatar ? (
                                                <Image
                                                    src={review.user.avatar as string}
                                                    alt={review.user.clientName || 'User'}
                                                    fill
                                                    className="object-cover"
                                                    sizes="32px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-medium uppercase">
                                                    {review.user?.clientName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-neutral-900 truncate">
                                                {review.user?.clientName || "Anonymous Buyer"}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">
                                                {formatDate(review.createdAt || review.create_at || review.createAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-2.5 h-2.5 ${i < review.star ? 'fill-orange-500 text-orange-500' : 'fill-neutral-100 text-neutral-100'}`}
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Right Side: Comment & Media */}
                                <div className="space-y-4">
                                    <p className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
                                        {review.comment}
                                    </p>

                                    {review.image && (
                                        <div className="relative w-20 h-20 rounded border border-neutral-100 overflow-hidden bg-neutral-50 group-hover:border-neutral-200 transition-colors">
                                            <Image
                                                src={review.image}
                                                alt="Review"
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredReviews.length > 5 && !showAllReviews && (
                            <div className="pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(true)}
                                    className="h-10 text-xs font-medium text-neutral-500 border-neutral-200 hover:text-orange-500 hover:border-orange-500 transition-all px-8 rounded"
                                >
                                    Read all {filteredReviews.length} reviews
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-neutral-50 rounded-lg">
                        <MessageSquare className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                        <p className="text-xs text-neutral-400">No reviews found for this selection.</p>
                    </div>
                )}
            </div>
        </section>
    );
}