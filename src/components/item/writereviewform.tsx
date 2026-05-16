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
        <div className="w-full">
            <header className="mb-3">
                <h3 className="text-sm font-medium text-foreground tracking-tight">Share your feedback</h3>
            </header>

            <div className="gap-3 flex flex-col">
                {/* Star Rating Section */}
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStar(s)}
                            className="p-0.5 focus:outline-none focus:ring-1 focus:ring-ring rounded-md transition-colors"
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
                        <span className="ml-2 text-xs font-medium text-orange-500">{star} / 5</span>
                    )}
                </div>

                {/* Textarea Input Container */}
                <div className="gap-3 flex flex-col">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Optional comments regarding preparation or quality..."
                        className="w-full bg-input border border-border rounded-md p-3 text-xs placeholder:text-secondary-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] md:min-h-[100px] resize-none"
                    />

                    {/* Image Attachment Section */}
                    <div className="flex flex-wrap items-center gap-2">
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
                                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Add Photo</span>
                            </button>
                        ) : (
                            <div className="relative w-14 h-14 rounded-md overflow-hidden border border-border bg-background group">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-1 right-1 bg-background border border-border text-foreground p-0.5 rounded-md transition-colors hover:bg-destructive hover:text-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-1">
                    <Button
                        onClick={handleSubmit}
                        disabled={star === 0 || !comment.trim() || createReviewMutation.isPending}
                        className="bg-orange-500 text-white hover:bg-orange-600 px-4 h-8 rounded-md transition-all text-xs font-medium focus:ring-1 focus:ring-ring disabled:bg-secondary disabled:text-secondary-foreground/40 shrink-0 flex items-center justify-center min-w-[90px]"
                    >
                        {createReviewMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                        ) : null}
                        {createReviewMutation.isPending ? 'Posting...' : 'Post Review'}
                    </Button>
                </div>
            </div>
        </div>
    );
}