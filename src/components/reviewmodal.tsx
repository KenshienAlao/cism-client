"use client"

import { X, Star, Camera, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId?: string;
    itemName?: string;
    onSubmitReview: (data: { rating: number; comment: string; imageFile?: File }) => void;
    isSubmitting?: boolean;
}

const RATING_LABELS: Record<number, string> = {
    5: 'Excellent',
    4: 'Great',
    3: 'Good',
    2: 'Fair',
    1: 'Poor',
};

export function ReviewModal({ isOpen, onClose, orderId, itemName, onSubmitReview, isSubmitting }: ReviewModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (rating === 0 || isSubmitting) return;
        onSubmitReview({ rating, comment, imageFile: imageFile || undefined });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full md:max-w-lg bg-white flex flex-col max-h-[92dvh] md:max-h-[85vh]">

                {/* Header */}
                <div className="px-4 md:px-8 py-4 md:py-5 border-b border-neutral-200 flex items-center justify-between shrink-0">
                    <button onClick={onClose} className="p-1 text-neutral-400">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xs md:text-sm font-black text-neutral-900 uppercase tracking-[0.2em]">
                        Rate Product
                    </h2>
                    <div className="w-5" /> {/* spacer */}
                </div>

                {/* Order ref strip */}
                <div className="px-4 md:px-8 py-3 md:py-4 bg-neutral-50 border-b border-neutral-200 shrink-0">
                    <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                        Order Ref: <span className="text-neutral-900">{orderId ?? '—'}</span>
                    </p>
                    {itemName && (
                        <p className="text-xs md:text-sm font-black text-neutral-900 mt-0.5 truncate">{itemName}</p>
                    )}
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-4 md:px-8 py-6 md:py-8 space-y-8">

                    {/* Star rating */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            Product Quality
                        </p>
                        <div className="flex items-center gap-2 md:gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`w-10 h-10 md:w-14 md:h-14 ${star <= rating ? 'fill-orange-500 text-orange-500' : 'fill-transparent text-neutral-200'}`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className={`text-xs md:text-sm font-black uppercase tracking-widest ${rating > 0 ? 'text-orange-500' : 'text-transparent'}`}>
                            {rating > 0 ? RATING_LABELS[rating] : 'placeholder'}
                        </p>
                    </div>

                    {/* Photo upload */}
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">
                            Photo (optional)
                        </p>
                        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 md:w-24 md:h-24 shrink-0 border border-dashed border-orange-500 flex flex-col items-center justify-center gap-1"
                            >
                                <Camera className="w-5 h-5 text-orange-500" />
                                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Add</span>
                            </button>

                            {imagePreview && (
                                <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 overflow-hidden border border-neutral-200">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="96px" />
                                    <button
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 flex items-center justify-center text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">
                            Your Review
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts to help other buyers…"
                            rows={4}
                            className="w-full p-4 bg-neutral-50 border border-neutral-200 text-sm font-medium text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-orange-500 resize-none"
                        />
                    </div>
                </div>

                {/* Footer — always visible submit */}
                <div className="px-4 md:px-8 py-4 md:py-6 border-t border-neutral-200 shrink-0">
                    <button
                        disabled={rating === 0 || isSubmitting}
                        onClick={handleSubmit}
                        className={`w-full py-3 md:py-4 text-xs md:text-sm font-black uppercase tracking-widest flex items-center justify-center ${rating > 0 && !isSubmitting ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                    >
                        {isSubmitting
                            ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                            : 'Submit Review'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}