import { useState } from 'react';
import { Star } from 'lucide-react';
import { Review, initReview } from "@/model/review.model";
import { createReviewSchema } from "@/validation/item.validation";
import { notifError } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function WriteReviewForm({
    stallId,
    itemId,
    onCreateReview
}: {
    stallId: number;
    itemId: number;
    onCreateReview: (stallId: number, itemId: number, star: number, comment: string) => Promise<void>
}) {
    const [reviewForm, setReviewForm] = useState<Review>(initReview);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        const valid = createReviewSchema.safeParse(reviewForm);
        if (!valid.success) {
            notifError(valid.error.issues[0].message);
            return;
        }
        setIsSubmitting(true);
        try {
            await onCreateReview(stallId, itemId, reviewForm.star, reviewForm.comment);
            setReviewForm(initReview);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                    <Button
                        onClick={handleSubmit}
                        disabled={reviewForm.star === 0 || !reviewForm.comment?.trim() || isSubmitting}
                        className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
