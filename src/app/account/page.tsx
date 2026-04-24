"use client";
import { useAuth } from "@/context/auth.context";
import { useConfirmation } from "@/context/confirmation.context";
import { AuthService } from "@/service/auth.service";
import { ArrowLeft, Camera, Shield, Mail, User, IdCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { notifError, notifSuccess } from "@/lib/toast";
import { useRef, useState } from "react";
import Loding from "@/components/ui/loading";

export default function Page() {
    const { profile, isLoading, logout, refreshUser } = useAuth();
    const { showConfirmation } = useConfirmation();
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
        setIsUploadingAvatar(true);

        const response = await AuthService.uploadAvatar(file);
        if (response.error) {
            notifError(response.error.message || "Failed to upload avatar");
            setAvatarPreview(null);
        } else {
            notifSuccess("Avatar updated successfully!");
            await refreshUser();
        }

        setIsUploadingAvatar(false);
    };

    if (isLoading || isUploadingAvatar || !profile) return <Loding />

    const handleDeleteAccount = () => {
        showConfirmation({
            title: "Account Deletion",
            message:
                "You are about to permanently delete your Account. This action is irreversible and all encrypted records will be lost.",
            confirmText: "Delete Account",
            type: "danger",
            onConfirm: () => {
                confirmDelete();
            },
        });
    };

    const confirmDelete = async () => {
        const response = await AuthService.deleteAccount();
        if (!response.error) {
            logout();
            router.push("/login");
        }
    };


    if (isLoading || isUploadingAvatar || !profile) return <Loding />

    return (
        <main className="min-h-screen bg-white px-5 py-10 text-neutral-900 sm:px-12 sm:py-16">
            <div className="mx-auto max-w-2xl">
                <header className="mb-10 sm:mb-16">
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase transition-colors hover:text-neutral-900"
                    >
                        <ArrowLeft
                            size={14}
                            className="transition-transform group-hover:-translate-x-1"
                        />
                        <span>Return</span>
                    </Link>
                </header>
                <section className="mb-12 flex items-center gap-5 sm:mb-24 sm:gap-8">
                    <div className="group relative shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl bg-neutral-50 text-base font-bold tracking-tighter text-neutral-900 uppercase ring-1 ring-neutral-100 transition-all group-hover:bg-neutral-100 sm:h-24 sm:w-24 sm:rounded-4xl sm:text-2xl">
                            {avatarPreview || profile?.user.avatar ? (
                                <img
                                    src={avatarPreview ?? profile?.user.avatar}
                                    alt="avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                profile?.user.username.slice(0, 2)
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
                            type="button"
                            disabled={isUploadingAvatar}
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -right-1 -bottom-1 rounded-full bg-white p-2 shadow-lg ring-1 ring-neutral-100 transition-transform hover:bg-neutral-900 hover:text-white active:scale-90 disabled:opacity-50 sm:p-2.5"
                        >
                            <Camera size={12} />
                        </button>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-xl font-light tracking-tight text-neutral-900 sm:text-3xl">
                            {profile?.user.username}
                        </h1>
                        <span className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase sm:text-[10px]">
                            <User size={12} /> {profile?.user.role || "N/A"}
                        </span>
                    </div>
                </section>

                <div className="space-y-12 sm:space-y-20">
                    <section>
                        <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
                            {[
                                {
                                    label: "Student ID",
                                    value: profile?.user.studentId,
                                    icon: <IdCard size={12} />,
                                },
                                {
                                    label: "Email",
                                    value: profile?.user.email,
                                    icon: <Mail size={12} />,
                                },
                            ].map((field, i) => (
                                <div
                                    key={i}
                                    className="group space-y-2 border-b border-neutral-50 pb-4 sm:space-y-3 sm:border-0 sm:pb-0"
                                >
                                    <div className="flex items-center gap-2 text-neutral-400 transition-colors group-hover:text-neutral-900">
                                        {field.icon}
                                        <label className="text-[9px] font-bold tracking-widest uppercase sm:text-[10px]">
                                            {field.label}
                                        </label>
                                    </div>
                                    <p className="truncate text-xs font-medium transition-colors hover:text-neutral-900 sm:text-sm">
                                        {field.value || "N/A"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                    <footer className="flex flex-col gap-3 pt-4 sm:gap-4 sm:pt-8">
                        <button
                            onClick={logout}
                            className="w-full rounded-xl bg-neutral-900 py-4 text-[9px] font-bold tracking-[0.4em] text-white uppercase shadow-lg transition-all hover:bg-black active:scale-[0.98] sm:rounded-2xl sm:py-5 sm:text-[10px]"
                        >
                            Logout
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full rounded-xl border border-neutral-100 py-3 text-[9px] font-bold tracking-[0.2em] text-neutral-400 uppercase transition-all hover:border-red-100 hover:text-red-500 active:scale-[0.99] sm:rounded-2xl sm:py-4 sm:text-[10px]"
                        >
                            Delete Account
                        </button>
                    </footer>
                </div>
            </div>
        </main>
    );
}
