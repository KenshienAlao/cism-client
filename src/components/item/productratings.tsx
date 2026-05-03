import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Review } from "@/model/review.model";
import { useState, useMemo } from 'react';

export function ProductRatings({ reviews, category }: { reviews: Review[], category?: string }) {
    const [selectedFilter, setSelectedFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
    const [showAllReviews, setShowAllReviews] = useState(false);

    const filteredReviews = useMemo(() => {
        if (selectedFilter === 'all') return reviews;
        return reviews.filter(r => r.star === selectedFilter);
    }, [reviews, selectedFilter]);

    const counts = useMemo(() => {
        const c = { all: reviews.length, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (r.star >= 1 && r.star <= 5) {
                c[r.star as 1 | 2 | 3 | 4 | 5]++;
            }
        });
        return c;
    }, [reviews]);

    const filterOptions: { id: 'all' | 5 | 4 | 3 | 2 | 1, label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 5, label: '5 Star' },
        { id: 4, label: '4 Star' },
        { id: 3, label: '3 Star' },
        { id: 2, label: '2 Star' },
        { id: 1, label: '1 Star' },
    ];

    return (
        <section className="mt-6 bg-white rounded-xl border border-neutral-200 p-4 md:p-6 mb-12">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 uppercase tracking-wider">Product Ratings</h2>

            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                <div className="flex gap-2 pb-2">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                setSelectedFilter(opt.id);
                                setShowAllReviews(false);
                            }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedFilter === opt.id
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {opt.id !== 'all' && <Star className={`w-4 h-4 ${selectedFilter === opt.id ? 'fill-white text-white' : 'fill-orange-500 text-orange-500'}`} />}
                            <span>{opt.label}</span>
                            <span className={`ml-1 text-xs ${selectedFilter === opt.id ? 'text-white/80' : 'text-gray-400'}`}>({counts[opt.id]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {filteredReviews.length > 0 ? (
                <div className="space-y-6">
                    {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 4)).map((review, index, arr) => (
                        <div key={review.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-neutral-100 pb-6' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center text-neutral-500 text-sm font-bold relative overflow-hidden">
                                {review.user?.avatar ? (
                                    <Image src={review.user.avatar as string} alt={review.user.clientName || 'User'} fill className="object-cover" sizes="40px" />
                                ) : (
                                    String.fromCharCode(65 + ((review.userId || 0) % 26))
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-neutral-900">{review.user?.clientName || (review.userId ? `User_${review.userId}` : 'Anonymous')}</div>
                                        <div className="text-xs text-neutral-400">
                                            {review.createAt ? new Date(review.createAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                        </div>
                                    </div>
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
                            </div>
                        </div>
                    ))}

                    {filteredReviews.length > 4 && (
                        <div className="pt-2 text-center border-t border-neutral-100">
                            <button
                                onClick={() => setShowAllReviews(!showAllReviews)}
                                className="px-6 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                            >
                                {showAllReviews ? 'See Less' : `See All ${filteredReviews.length} Reviews`}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-neutral-200 mb-3" />
                    <p className="text-sm text-neutral-500">No ratings yet</p>
                </div>
            )}
        </section>
    );
}
