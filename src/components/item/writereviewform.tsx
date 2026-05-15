'use client';

import { useState, useRef } from 'react';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { createReviewSchema } from "@/validation/item.validation";
import { notifError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useItem } from '@/hooks/use-item';
import Image from 'next/image';

export function WriteReviewForm({
    stallId,
    itemId
}: {
    stallId: number;
    itemId: number;
}) {
    const { createReviewMutation } = useItem();
    const [star, setStar] = useState(0);
    const [comment, setComment] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = () => {
        const payload = { stallId, itemId, star, comment, image: imageFile || undefined };
        const valid = createReviewSchema.safeParse({ star, comment });

        if (!valid.success) {
            notifError(valid.error.issues[0].message);
            return;
        }

        createReviewMutation.mutate(payload);
        
        setStar(0);
        setComment("");
        removeImage();
    };

    return (
        <section className="py-8 border-t border-neutral-100">
            <div className="max-w-2xl">
                <header className="mb-6">
                    <h3 className="text-sm font-medium text-neutral-900 mb-1">Share your thoughts</h3>
                    <p className="text-xs text-neutral-500">Your review helps other customers make better choices.</p>
                </header>

                <div className="space-y-6">
                    {/* Star Rating */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setStar(s)}
                                    className="transition-transform active:scale-95 p-0.5"
                                >
                                    <Star
                                        className={`w-6 h-6 transition-colors ${
                                            s <= star
                                                ? 'text-orange-500 fill-orange-500'
                                                : 'text-neutral-200 hover:text-orange-200'
                                        }`}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                            {star > 0 && (
                                <span className="ml-2 text-xs font-medium text-orange-600">{star}/5</span>
                            )}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="space-y-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was the quality? Did it meet your expectations?"
                            className="w-full bg-white border border-neutral-200 rounded-md p-4 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all min-h-[120px] resize-none"
                        />

                        {/* Image Upload Area */}
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />

                            {!imagePreview ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-md bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span className="text-xs font-medium">Add Photo</span>
                                </button>
                            ) : (
                                <div className="relative w-20 h-20 rounded-md overflow-hidden border border-neutral-200">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-1 right-1 bg-black/70 text-clwhite p-1 rounded-sm hover:bg-black transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-[10px] text-neutral-400 max-w-[200px]">
                            Reviews are public and include your account name.
                        </p>
                        <Button
                            onClick={handleSubmit}
                            disabled={star === 0 || !comment.trim() || createReviewMutation.isPending}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-8 h-10 rounded transition-colors text-xs font-medium shadow-none disabled:bg-neutral-100 disabled:text-neutral-400"
                        >
                            {createReviewMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : 'Post Review'}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}