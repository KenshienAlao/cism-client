import { useState, useRef } from 'react';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { initReview } from "@/model/review.model";
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

    const handleSubmit = async () => {
        const payload = { stallId, itemId, star, comment, image: imageFile || undefined };
        const valid = createReviewSchema.safeParse({ star, comment });

        if (!valid.success) {
            notifError(valid.error.issues[0].message);
            return;
        }

        try {
            await createReviewMutation.mutateAsync(payload);
            setStar(0);
            setComment("");
            removeImage();
        } catch (error) {
            // Error handled by mutation
        }
    };

    return (
        <section className="mt-8 bg-white rounded-lg border border-neutral-200 p-5 md:p-6">
            <h2 className="text-[10px] font-bold text-neutral-400 mb-6 uppercase tracking-[0.2em]">Write a Review</h2>

            <div className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-neutral-900">How would you rate this?</span>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStar(s)}
                                className="transition-transform active:scale-90"
                            >
                                <Star
                                    className={`w-8 h-8 ${s <= star
                                        ? 'text-orange-500 fill-orange-500'
                                        : 'text-neutral-100'
                                        }`}
                                    strokeWidth={2}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment area */}
                <div className="space-y-3">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell others about your experience..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm focus:bg-white focus:outline-none focus:border-orange-500 transition-colors min-h-[100px] resize-none"
                    />

                    {/* Image Upload */}
                    <div className="flex flex-wrap gap-3">
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
                                className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 hover:text-orange-500 hover:border-orange-500 transition-colors"
                            >
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[9px] font-bold uppercase">Add Photo</span>
                            </button>
                        ) : (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    onClick={removeImage}
                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={star === 0 || !comment.trim() || createReviewMutation.isPending}
                        className="w-full sm:w-auto bg-orange-500 text-white font-bold py-6 px-10 rounded-md hover:bg-orange-600 transition-colors text-xs uppercase h-auto disabled:bg-neutral-100 disabled:text-neutral-300"
                    >
                        {createReviewMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : 'Submit Review'}
                    </Button>
                </div>
            </div>
        </section>
    );
}
