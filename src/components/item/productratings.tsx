import { Star, MessageSquare, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Review } from "@/model/review.model";
import { useState, useMemo } from 'react';
import { formatDate } from '@/lib/utils/formatDate';

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

    const filterOptions: { id: 'all' | 'media' | 5 | 4 | 3 | 2 | 1, label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'media', label: 'With Photo' },
        { id: 5, label: '5 Star' },
        { id: 4, label: '4 Star' },
        { id: 3, label: '3 Star' },
        { id: 2, label: '2 Star' },
        { id: 1, label: '1 Star' },
    ];

    const avgRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.star, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    return (
        <section className="mt-8 bg-white border-t border-neutral-100 p-0 md:p-6 mb-12">
            <div className="px-4 py-6 md:px-0 max-w-4xl mx-auto">
                <h2 className="text-xs font-bold text-neutral-900 mb-6 uppercase tracking-widest">Product Ratings</h2>

                {/* Simplified Summary & Filter Bar */}
                <div className="bg-neutral-50 rounded-lg border border-neutral-100 overflow-hidden mb-8">
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                        {/* Rating Summary */}
                        <div className="p-6 md:w-1/3 flex flex-col items-center justify-center text-center">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-orange-500">{avgRating}</span>
                                <span className="text-sm font-bold text-neutral-400">/ 5</span>
                            </div>
                            <div className="flex items-center gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-orange-500 text-orange-500' : 'fill-neutral-200 text-neutral-200'}`}
                                        strokeWidth={2}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">{reviews.length} reviews</p>
                        </div>

                        {/* Filters */}
                        <div className="p-6 md:flex-1 flex flex-col justify-center">
                            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">Filter Reviews</label>
                            <div className="relative group">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedFilter(val === 'all' || val === 'media' ? val : Number(val) as any);
                                        setShowAllReviews(false);
                                    }}
                                    className="w-full bg-white border border-neutral-200 rounded-md px-4 py-3 text-xs font-bold text-neutral-700 appearance-none outline-none focus:border-orange-500 accent-orange-500 transition-colors cursor-pointer pr-10"
                                >
                                    {filterOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.label} ({counts[opt.id]})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredReviews.length > 0 ? (
                    <div className="space-y-8">
                        {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 5)).map((review, index) => (
                            <div key={review.id || index} className="flex gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex-shrink-0 relative overflow-hidden border border-neutral-200">
                                    {review.user?.avatar ? (
                                        <Image
                                            src={review.user.avatar as string}
                                            alt={review.user.clientName || 'User'}
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-xs">
                                            {review.user?.clientName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-3 min-w-0">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-neutral-900">
                                                    {review.user?.clientName || "Buyer"}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-2.5 h-2.5 ${i < review.star ? 'fill-orange-500 text-orange-500' : 'fill-neutral-100 text-neutral-100'}`}
                                                                strokeWidth={2}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] text-neutral-400 font-bold uppercase">Verified</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] text-neutral-400 font-bold uppercase whitespace-nowrap">{formatDate(review.createdAt || review.create_at || review.createAt)}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-neutral-600 leading-normal">
                                        {review.comment}
                                    </p>

                                    {review.image && (
                                        <div className="mt-2">
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200 cursor-default">
                                                <Image
                                                    src={review.image}
                                                    alt="Review proof"
                                                    fill
                                                    className="object-cover"
                                                    sizes="96px"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredReviews.length > 5 && !showAllReviews && (
                            <div className="pt-4 text-center">
                                <button
                                    onClick={() => setShowAllReviews(true)}
                                    className="w-full py-3 text-[10px] font-bold text-orange-500 border border-neutral-200 rounded-lg transition-colors uppercase tracking-widest"
                                >
                                    View All {filteredReviews.length} Reviews
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-16 text-center flex flex-col items-center justify-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                        <MessageSquare className="w-10 h-10 text-neutral-200 mb-4" />
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No matching reviews</p>
                    </div>
                )}
            </div>
        </section>
    );
}
