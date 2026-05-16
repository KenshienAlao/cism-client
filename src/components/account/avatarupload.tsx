"use client";

import { useAuth } from "@/hooks/use-auth";
import { notifError } from "@/lib/toast";
import { useRef, useState } from "react";
import { Loader2, Camera, User } from "lucide-react";

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

    const initials = profile?.user?.clientName?.trim().split(/\s+/)[0]?.[0] || "";

    return (
        <div className="flex flex-row lg:flex-col items-center gap-4 w-full">
            {/* Image Frame */}
            <div 
                className="relative cursor-pointer group shrink-0 focus-within:ring-1 focus-within:ring-orange-500 rounded-md outline-none" 
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
                <div className="h-16 w-16 lg:h-20 lg:w-20 overflow-hidden rounded-md border border-border bg-secondary/40 flex items-center justify-center transition-colors group-hover:border-orange-500/50">
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
                            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        </div>
                    )}
                    
                    {avatarPreview || profile?.user?.avatar ? (
                        <img
                            src={avatarPreview ?? profile?.user?.avatar}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center">
                            {initials ? (
                                <span className="text-base font-semibold text-secondary-foreground uppercase tracking-tight">
                                    {initials}
                                </span>
                            ) : (
                                <User className="text-secondary-foreground/60" size={18} />
                            )}
                        </div>
                    )}

                    {/* Simple Camera Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={16} />
                    </div>
                </div>
            </div>

            {/* Upload Controls */}
            <div className="flex flex-col items-start gap-2 flex-1 w-full">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                
                <div className="text-left hidden lg:block">
                    <p className="text-xs text-secondary-foreground/60 leading-normal">
                        Supports JPEG, PNG, or WebP. Max size of 2MB.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-2.5 py-1.5 border border-border bg-card rounded-md text-xs font-medium text-foreground hover:bg-secondary/60 transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isUploadingAvatar ? "Uploading..." : "Change avatar"}
                </button>
            </div>
        </div>
    );
}