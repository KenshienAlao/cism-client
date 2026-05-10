"use client"

import { X, Star, Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react';
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

export function ReviewModal({
    isOpen,
    onClose,
    orderId,
    itemName,
    onSubmitReview,
    isSubmitting
}: ReviewModalProps) {
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
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (rating === 0) return;
        onSubmitReview({
            rating,
            comment,
            imageFile: imageFile || undefined
        });
    };

    if (!isOpen) return null;

    const ratingLabels: Record<number, string> = {
        5: "Excellent!",
        4: "Great!",
        3: "Good",
        2: "Fair",
        1: "Poor"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}  
            <div className="relative w-full max-w-md bg-white shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <button onClick={onClose} className="p-1 hover:bg-neutral-50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                    <h2 className="text-base font-bold text-neutral-900">Rate Product</h2>
                    <button
                        disabled={rating === 0 || isSubmitting}
                        onClick={handleSubmit}
                        className="text-sm font-bold text-orange-500 disabled:text-neutral-300 transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[80vh]">
                    {/* Product Summary */}
                    <div className="p-6 flex items-center gap-4 bg-neutral-50/50">
                        <div className="w-12 h-12 bg-white border border-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <Star className="w-6 h-6 text-orange-500/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-neutral-900 truncate">{itemName || "Order Item"}</h3>
                            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Ref: {orderId}</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Rating Section */}
                        <div className="text-center space-y-4">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Product Quality</h4>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isActive = star <= rating;
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-all ${isActive
                                                    ? "fill-orange-500 text-orange-500"
                                                    : "text-neutral-200 fill-transparent"
                                                    }`}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            {rating > 0 && (
                                <p className="text-sm font-bold text-orange-500 animate-in fade-in slide-in-from-top-1">
                                    {ratingLabels[rating]}
                                </p>
                            )}
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-4">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
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
                                    className="w-20 h-20 shrink-0 border border-dashed border-orange-500 bg-orange-50/50 flex flex-col items-center justify-center gap-1.5 rounded-lg group"
                                >
                                    <Camera className="w-5 h-5 text-orange-500" />
                                    <span className="text-[9px] font-bold text-orange-500 uppercase">Add Photo</span>
                                </button>

                                {imagePreview && (
                                    <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-neutral-100 group">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                        <button
                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Input */}
                        <div className="space-y-3">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share more thoughts on the product to help other buyers"
                                rows={5}
                                className="w-full p-4 bg-neutral-50 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-orange-500/20 transition-all resize-none placeholder:text-neutral-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-neutral-100 md:hidden">
                    <button
                        disabled={rating === 0 || isSubmitting}
                        onClick={handleSubmit}
                        className={`w-full py-4 rounded-full font-bold text-sm transition-all ${rating > 0 && !isSubmitting
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "bg-neutral-100 text-neutral-300"
                            }`}
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}