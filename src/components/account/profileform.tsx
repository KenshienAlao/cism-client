"use client";

import { useAuth } from "@/hooks/use-auth";
import { initUpdateUserRequest, UpdateUserRequest } from "@/model/user.model";
import { ROLES } from "@/config/app.config";
import { UpdateUserSchema } from "@/validation/user.validation";
import { notifError } from "@/lib/toast";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

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

    // Common input styling based on theme tokens
    const inputStyles = "w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/50";
    const labelStyles = "text-[10px] font-bold text-muted-foreground uppercase tracking-widest";

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Identity Fields Group */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-1.5">
                    <label className={labelStyles}>Full Name</label>
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                        className={inputStyles}
                        placeholder="John Doe"
                    />
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                    <label className={labelStyles}>Email Address</label>
                    <input
                        type="email"
                        value={profile?.user?.email || ""}
                        readOnly
                        className={`${inputStyles} bg-secondary/50 text-secondary-foreground cursor-not-allowed border-transparent`}
                    />
                </div>
            </div>

            <hr className="border-border/50" />

            {/* Verification Fields Group */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-1.5">
                    <label className={labelStyles}>Student ID</label>
                    <input
                        type="text"
                        value={form.studentId}
                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                        className={inputStyles}
                        placeholder="00-0000-000"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <label className={labelStyles}>Account Role</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(ROLES).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setForm({ ...form, role: r as any })}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                    form.role === r
                                        ? "border-primary bg-accent text-accent-foreground"
                                        : "border-border bg-card text-muted-foreground hover:border-muted hover:text-foreground"
                                }`}
                            >
                                {form.role === r && <Check size={12} />}
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 flex items-center justify-between border-t border-border/50">
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-primary">
                            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            Unsaved Changes
                        </span>
                    )}
                </div>
                
                <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile || !hasChanges}
                    className={`px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                        hasChanges 
                            ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm active:scale-95" 
                            : "bg-secondary text-secondary-foreground cursor-not-allowed"
                    }`}
                >
                    {isUpdatingProfile ? "Updating..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}