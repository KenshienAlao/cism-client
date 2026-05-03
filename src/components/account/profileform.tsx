"use client";

import { useAuth } from "@/hooks/use-auth";
import { initUpdateUserRequest, UpdateUserRequest } from "@/model/user.model";
import { ROLES } from "@/config/app.config";
import { UpdateUserSchema } from "@/validation/user.validation";
import { notifError } from "@/lib/toast";
import { useState, useEffect } from "react";

export function ProfileForm() {
    const { profile, updateProfile, isUpdatingProfile } = useAuth();
    const [form, setForm] = useState<UpdateUserRequest>(initUpdateUserRequest);

    useEffect(() => {
        if (profile?.user) {
            setForm({
                role: profile.user.role as "STUDENT" | "FACULTY" | "STAFF" || "STUDENT",
                studentId: profile.user.studentId || "",
                clientName: profile.user.clientName || "",
            });
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        const valid = UpdateUserSchema.safeParse(form);
        if (!valid.success) {
            notifError(valid.error.issues[0].message);
            return;
        }

        await updateProfile(valid.data);
    };

    const hasChanges = (profile?.user?.clientName || "") !== form.clientName ||
                       (profile?.user?.studentId || "") !== form.studentId ||
                       (profile?.user?.role || "STUDENT") !== form.role;

    return (
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
                            onClick={() => setForm({ ...form, role: r as any })}
                            className={`border px-3 py-1.5 text-[11px] transition-all md:px-4 md:py-2 md:text-xs ${
                                form.role === r
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {hasChanges && (
                <div className="grid grid-cols-1 items-center gap-4 pt-4 md:grid-cols-[100px_1fr]">
                    <div className="hidden md:block" />
                    <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="w-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:w-24"
                    >
                        {isUpdatingProfile ? "..." : "Save"}
                    </button>
                </div>
            )}
        </div>
    );
}
