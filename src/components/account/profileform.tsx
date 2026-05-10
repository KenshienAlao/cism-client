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
            <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-6">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest md:text-right">Name</label>
                <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full border border-neutral-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-6">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest md:text-right">Email</label>
                <div className="text-sm font-bold text-neutral-700 px-1">{profile?.user?.email}</div>
            </div>

            <div className="grid grid-cols-1 items-start gap-1 md:grid-cols-[100px_1fr] md:items-center md:gap-6">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest md:text-right">Student ID</label>
                <input
                    type="text"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full border border-neutral-200 rounded-md px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-[100px_1fr] md:items-center md:gap-6">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest md:text-right">Role</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(ROLES).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setForm({ ...form, role: r as any })}
                            className={`border px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${form.role === r
                                ? "border-orange-500 bg-orange-50 text-orange-500"
                                : "border-neutral-200 text-neutral-500"
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {hasChanges && (
                <div className="grid grid-cols-1 items-center gap-4 pt-6 md:grid-cols-[100px_1fr] md:gap-6">
                    <div className="hidden md:block" />
                    <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="w-full bg-orange-500 py-3 rounded-md text-[11px] font-bold text-white uppercase tracking-[0.2em] transition-colors hover:bg-orange-600 disabled:opacity-50 md:w-32"
                    >
                        {isUpdatingProfile ? "..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
