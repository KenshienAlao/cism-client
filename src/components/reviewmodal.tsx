import { X, Star } from 'lucide-react';
import { useState } from 'react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onSubmitReview: (rating: number, review: string) => void;
}

export function ReviewModal({ isOpen, onClose, orderId, onSubmitReview }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        onSubmitReview(rating, review);
        setRating(0);
        setHoverRating(0);
        setReview('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            <div className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto z-50 md:w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Rate Your Order</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
                        <div className="flex justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const isActive = star <= (hoverRating || rating);
                                return (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${isActive
                                                ? 'fill-orange-400 text-orange-400'
                                                : 'text-gray-300'
                                                }`}
                                            strokeWidth={2}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm font-medium text-gray-700">
                                {rating === 5 && '🎉 Excellent!'}
                                {rating === 4 && '😊 Great!'}
                                {rating === 3 && '🙂 Good'}
                                {rating === 2 && '😐 Fair'}
                                {rating === 1 && '😞 Poor'}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Share your experience (optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Tell us about your order..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className="w-full bg-orange-500 text-white py-3.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </>
    );
}
