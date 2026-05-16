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
        <section className="py-2">
            <div className="w-full">
                <header className="mb-4">
                    <h3 className="text-sm font-medium text-foreground mb-0.5">Share your thoughts</h3>
                    <p className="text-xs text-secondary-foreground/70">Your review helps other customers make better choices.</p>
                </header>

                <div className="space-y-4">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStar(s)}
                                className="transition-transform active:scale-95 p-0.5 focus:outline-none rounded-md focus:ring-1 focus:ring-ring"
                            >
                                <Star
                                    className={`w-5 h-5 transition-colors ${
                                        s <= star
                                            ? 'text-orange-500 fill-orange-500'
                                            : 'text-secondary-foreground/30 hover:text-orange-500/50'
                                    }`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                        {star > 0 && (
                            <span className="ml-1.5 text-xs font-semibold text-orange-500">{star}/5</span>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="space-y-3">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was the quality? Did it meet your expectations?"
                            className="w-full bg-input border border-border rounded-md p-3 text-sm placeholder:text-secondary-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring transition-all min-h-[100px] resize-none"
                        />

                        {/* Image Upload */}
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
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md bg-background text-foreground hover:bg-secondary transition-colors text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <Camera className="w-3.5 h-3.5 text-secondary-foreground/70" />
                                    <span>Add Photo</span>
                                </button>
                            ) : (
                                <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border bg-background">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-1 right-1 bg-foreground/80 text-background p-1 rounded-md hover:bg-foreground transition-colors"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                        <p className="text-[10px] text-secondary-foreground/60 max-w-[220px] leading-normal">
                            Reviews are public and include your account name.
                        </p>
                        <Button
                            onClick={handleSubmit}
                            disabled={star === 0 || !comment.trim() || createReviewMutation.isPending}
                            className="bg-orange-500 text-white hover:bg-orange-600 px-5 h-9 rounded-md transition-all text-xs font-medium shadow-none disabled:bg-secondary disabled:text-secondary-foreground/40"
                        >
                            {createReviewMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : 'Post Review'}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}