"use client";
import { useAuth } from "@/hooks/use-auth";
import { useConfirmation } from "@/context/confirmation.context";
import { authService } from "@/service/auth.service";
import { LogOut, MoveLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { notifError, notifSuccess } from "@/lib/toast";
import { useRef, useState, useEffect } from "react";
import Loading from "@/components/ui/loading";
import { ROLES } from "@/config/app.config";
import Link from "next/link";
import { initUpdateUserRequest, UpdateUserRequest } from "@/model/user.model";
import { UpdateUserSchema } from "@/validation/user.validation";

export default function Page() {
    const { profile, isLoading, logout, refreshUser } = useAuth();
    const { showConfirmation } = useConfirmation();
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState<UpdateUserRequest>(initUpdateUserRequest);

    useEffect(() => {
        if (profile?.user) {
            setForm({
                role: profile.user.role as "STUDENT" | "FACULTY" | "STAFF" || "STUDENT",
                studentId: profile.user.studentId || "",
                clientName: profile.user.clientName || "",
            })
        }
    }, [profile]);

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

        const response = await authService.uploadAvatar(file);
        if (!response.success) {
            notifError(response.message || "Failed to upload avatar");
            setAvatarPreview(null);
        } else {
            notifSuccess("Avatar updated successfully!");
            await refreshUser();
        }

        setIsUploadingAvatar(false);
    };

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        const valid = UpdateUserSchema.safeParse(form);
        if (!valid.success) {
            notifError(valid.error.issues[0].message);
            setIsSaving(false);
            return;
        }

        const response = await authService.updateProfile(valid.data);
        if (response.success) {
            notifSuccess("Profile updated successfully!");
            await refreshUser();
        } else {
            notifError(response.message || "Failed to update profile");
        }
        setIsSaving(false);
    };

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
        const response = await authService.deleteAccount();
        if (response.success) {
            logout();
            router.push("/login");
        }
    };
    if (isLoading || !profile) return <Loading />;

    const initials = profile?.user?.clientName?.split(" ")[0][0];

    return (
        <main className="min-h-screen bg-[#F5F5F5] font-sans text-neutral-800">
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
                    <Link href="/" className="flex items-center gap-2 text-sm text-neutral-800">
                        <MoveLeft size={16} />
                    </Link>
                    <span className="text-sm text-neutral-800">My Account</span>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
                <aside className="hidden w-48 shrink-0 space-y-6 md:block">
                    <nav className="space-y-1">
                        <div className="flex items-center gap-3 border-l-2 border-primary bg-white/50 py-2 pl-1.5 pr-2 text-sm font-medium text-primary">
                            <User size={16} /> My Account
                        </div>
                        <button onClick={logout} className="flex items-center gap-3 rounded-sm border-l-2 border-transparent px-2 py-2 text-sm font-medium text-neutral-600 hover:text-primary">
                            <LogOut size={16} /> Logout
                        </button>
                    </nav>
                </aside>
                <div className="flex-1 space-y-6">
                    <section className="border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 border-b border-neutral-100 pb-4">
                            <h2 className="text-lg font-medium">My Profile</h2>
                            <p className="text-sm text-neutral-500">Manage and protect your account</p>
                        </div>

                        <div className="flex flex-col gap-10 md:flex-row">
                            {/* Form Fields */}
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-4">
                                    <label className="text-xs text-neutral-500 md:text-sm md:text-right">Name</label>
                                    <input
                                        type="text"
                                        value={form.clientName}
                                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-4">
                                    <label className="text-xs text-neutral-500 md:text-sm md:text-right">Email</label>
                                    <div className="text-sm font-medium">{profile?.user?.email}</div>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-4">
                                    <label className="text-xs text-neutral-500 md:text-sm md:text-right">Student ID</label>
                                    <input
                                        type="text"
                                        value={form.studentId}
                                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[100px_1fr] md:items-center md:gap-4">
                                    <label className="text-xs text-neutral-500 md:text-sm md:text-right">Role</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.values(ROLES).map((r) => (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setForm({ ...form, role: r })}
                                                className={`border px-3 py-1.5 text-[11px] transition-all md:px-4 md:py-2 md:text-xs ${form.role === r
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {((profile?.user?.clientName || "") !== form.clientName || (profile?.user?.studentId || "") !== form.studentId || (profile?.user?.role || "STUDENT") !== form.role) && (
                                    <div className="grid grid-cols-1 items-center gap-4 pt-4 md:grid-cols-[100px_1fr]">
                                        <div className="hidden md:block" />
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isSaving}
                                            className="w-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:w-24"
                                        >
                                            {isSaving ? "..." : "Save"}
                                        </button>
                                    </div>
                                )}
                            </div>
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
                        </div>
                    </section>
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-3 border border-neutral-200 bg-white py-4 text-sm font-bold text-neutral-800 transition-all hover:bg-neutral-50 active:scale-[0.99]"
                    >
                        <LogOut size={18} /> Logout
                    </button>

                    {/* Danger Zone */}
                    <section className="border border-red-100 bg-red-50/10 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-red-500">Delete Account</h3>
                                <p className="text-[12px] text-neutral-400">Once you delete your account, there is no going back.</p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="border border-red-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}