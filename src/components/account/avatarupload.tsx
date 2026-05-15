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

    const initials = profile?.user?.clientName?.split(" ")[0][0] || "";

    return (
        <div className="flex flex-col items-center lg:items-start gap-6">
            {/* Image Frame */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="h-24 w-24 overflow-hidden rounded-md border border-border bg-secondary flex items-center justify-center transition-colors group-hover:border-primary/50">
                    {isUploadingAvatar ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : null}
                    
                    {avatarPreview || profile?.user?.avatar ? (
                        <img
                            src={avatarPreview ?? profile?.user?.avatar}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            {initials ? (
                                <span className="text-xl font-bold text-secondary-foreground uppercase">
                                    {initials}
                                </span>
                            ) : (
                                <User className="text-muted-foreground" size={24} />
                            )}
                        </div>
                    )}

                    {/* Camera Overlay */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-primary" size={20} />
                    </div>
                </div>
            </div>

            {/* Upload Controls */}
            <div className="flex flex-col items-center lg:items-start gap-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                
                <div className="text-center lg:text-left space-y-1.5">
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                        Profile Image
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase leading-relaxed tracking-wide">
                        JPG, PNG or WebP <br />
                        Maximum size 2MB
                    </p>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-4 py-1.5 border border-border bg-card rounded-md text-[10px] font-bold text-secondary-foreground uppercase tracking-widest hover:bg-secondary hover:text-foreground transition-all disabled:opacity-50"
                >
                    {isUploadingAvatar ? "Uploading..." : "Upload New"}
                </button>
            </div>
        </div>
    );
}