"use client";

import { useAuth } from "@/hooks/use-auth";
import { notifError } from "@/lib/toast";
import { useRef, useState } from "react";

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
        <div className="order-first flex flex-col items-center gap-4 border-neutral-100 pb-8 md:order-last md:w-64 md:border-l md:pb-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50 md:h-24 md:w-24">
                {isUploadingAvatar && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                )}
                {avatarPreview || profile?.user?.avatar ? (
                    <img
                        src={avatarPreview ?? profile?.user?.avatar}
                        alt="avatar"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-neutral-400">
                        {initials}
                    </div>
                )}
            </div>
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
                className="border border-neutral-200 px-4 py-2 text-[11px] text-neutral-600 transition-opacity hover:bg-neutral-50 disabled:opacity-50"
            >
                {isUploadingAvatar ? "Uploading..." : "Select Image"}
            </button>
            <div className="text-[10px] text-neutral-400 text-center md:text-[12px]">
                <p>File size: maximum 2 MB</p>
                <p>File extension: .JPEG, .PNG</p>
            </div>
        </div>
    );
}
