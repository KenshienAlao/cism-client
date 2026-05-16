"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Camera, Loader2 } from 'lucide-react';
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
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = () => {
        if (rating === 0 || isSubmitting) return;
        onSubmitReview({ rating, comment, imageFile: imageFile || undefined });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-99999 flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
                    
                    {/* Backdrop*/}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'linear' }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-none" 
                        onClick={onClose} 
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
                        className="relative w-full md:max-w-md bg-card border-t md:border border-border rounded-t-lg md:rounded-lg flex flex-col max-h-[92dvh] md:max-h-[85vh] text-foreground shadow-none z-10"
                    >
                        {/* Header */}
                        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between shrink-0">
                            <button 
                                onClick={onClose} 
                                className="p-1 text-foreground/40 hover:text-foreground transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Rate Product
                            </h2>
                            <div className="w-6" />
                        </div>

                        <div className="px-4 py-3 bg-secondary border-b border-border shrink-0">
                            <p className="text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
                                Order Reference: <span className="text-foreground/90 font-mono font-semibold">{orderId ?? '—'}</span>
                            </p>
                            {itemName && (
                                <p className="text-sm font-medium text-foreground mt-0.5 truncate">{itemName}</p>
                            )}
                        </div>

                        {/* Form Body */}
                        <div className="overflow-y-auto flex-1 p-4 md:p-5 space-y-5 no-scrollbar">
                            <div className="flex flex-col items-center gap-2 py-2 bg-secondary/30 border border-border rounded-lg">
                                <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
                                    Product Quality
                                </p>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isSelected = star <= rating;
                                        return (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileTap={{ scale: 0.92 }}
                                                onClick={() => setRating(star)}
                                                className="p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md text-border transition-colors"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${
                                                        isSelected 
                                                            ? 'fill-orange-500 text-orange-500' 
                                                            : 'fill-transparent text-foreground/20 hover:text-foreground/40'
                                                    }`}
                                                    strokeWidth={1.5}
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <p className={`text-xs font-medium tracking-wide h-4 transition-colors ${
                                    rating > 0 ? 'text-orange-500' : 'text-transparent select-none'
                                }`}>
                                    {rating > 0 ? RATING_LABELS[rating] : 'No score'}
                                </p>
                            </div>

                            {/* Photo Upload  */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
                                    Photo <span className="lowercase text-foreground/30">(optional)</span>
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                                        className="w-16 h-16 shrink-0 border border-dashed border-border bg-input hover:bg-secondary/70 transition-colors flex flex-col items-center justify-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <Camera className="w-4 h-4 text-foreground/40" />
                                        <span className="text-[9px] font-medium text-foreground/50 tracking-wide">Add</span>
                                    </button>

                                    <AnimatePresence>
                                        {imagePreview && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="relative w-16 h-16 shrink-0 overflow-hidden border border-border rounded-md bg-secondary"
                                            >
                                                <Image 
                                                    src={imagePreview} 
                                                    alt="Preview asset" 
                                                    fill 
                                                    className="object-cover" 
                                                    sizes="64px" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleClearImage}
                                                    className="absolute top-1 right-1 w-4 h-4 bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground rounded-md transition-colors"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Feedback Input */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
                                    Your Review
                                </p>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your thoughts to help other buyers…"
                                    rows={4}
                                    className="w-full p-3 bg-input border border-border text-sm font-normal text-foreground placeholder:text-foreground/30 rounded-md outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 resize-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border bg-card shrink-0 rounded-b-lg">
                            <button
                                disabled={rating === 0 || isSubmitting}
                                onClick={handleSubmit}
                                className={`w-full py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                                    rating > 0 && !isSubmitting 
                                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                        : 'bg-secondary text-foreground/30 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    'Submit Review'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}