"use client";

import { useAuth } from "@/hooks/use-auth";
import { notifError } from "@/lib/toast";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function AvatarUpload() {
    const { profile, uploadAvatar, isUploadingAvatar } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE_MB = 2;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            notifError(`Avatar must be under ${MAX_SIZE_MB}MB.`);
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            notifError("Only JPG, PNG, or WebP images are allowed.");
            return;
        }

        setAvatarPreview(URL.createObjectURL(file));

        const response = await uploadAvatar(file);
        if (!response.success) {
            setAvatarPreview(null);
        }
    };

    const initials = profile?.user?.clientName?.split(" ")[0][0];

    return (
        <div className="order-first flex flex-col items-center gap-6 border-neutral-100 pb-8 md:order-last md:w-64 md:border-l md:pb-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-neutral-100 bg-neutral-50 shadow-inner">
                {isUploadingAvatar && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    </div>
                )}
                {avatarPreview || profile?.user?.avatar ? (
                    <img
                        src={avatarPreview ?? profile?.user?.avatar}
                        alt="avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-neutral-300">
                        {initials}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="border border-neutral-200 px-6 py-2 rounded-md text-[10px] font-bold text-neutral-700 uppercase tracking-widest transition-colors active:bg-neutral-50 disabled:opacity-50"
                >
                    {isUploadingAvatar ? "Uploading..." : "Select Image"}
                </button>
                <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter text-center leading-relaxed">
                    <p>Maximum 2 MB</p>
                    <p>JPEG, PNG, WEBP</p>
                </div>
            </div>
        </div>
    );
}
