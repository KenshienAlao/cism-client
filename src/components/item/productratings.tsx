import { Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Review } from "@/model/review.model";

export function ProductRatings({ reviews, category }: { reviews: Review[], category?: string }) {
    return (
        <section className="mt-6 bg-white rounded-xl border border-neutral-200 p-4 md:p-6 mb-12">
            <h2 className="text-lg font-bold text-neutral-900 mb-6 uppercase tracking-wider">Product Ratings</h2>

            {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review, index) => (
                        <div key={review.id || index} className={`flex gap-4 ${index !== reviews.length - 1 ? 'border-b border-neutral-100 pb-6' : ''}`}>
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
                                <div className="text-xs text-neutral-400 mt-2">
                                    Variation: {category}
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
    );
}
