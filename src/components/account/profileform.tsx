"use client";

import { useAuth } from "@/hooks/use-auth";
import { initUpdateUserRequest, UpdateUserRequest } from "@/model/user.model";
import { ROLES } from "@/config/app.config";
import { UpdateUserSchema } from "@/validation/user.validation";
import { notifError } from "@/lib/toast";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export function ProfileForm({ logout }: { logout: () => void }) {
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

    // Strict UI token system bindings 
    const inputStyles = "w-full bg-input border border-border rounded-md px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder:text-secondary-foreground/40";
    const labelStyles = "text-xs font-medium text-foreground mb-1.5 block";

    return (
        <div className="space-y-5">
            {/* Structured Compact Grid - Smooth transformation across iPhone SE and 1080p */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                
                {/* Full Name field container */}
                <div>
                    <label className={labelStyles}>Full Name</label>
                    <input
                        type="text"
                        value={form.clientName}
                        onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                        className={inputStyles}
                        placeholder="John Doe"
                    />
                </div>

                {/* Email Address field container */}
                <div>
                    <label className={labelStyles}>Email Address</label>
                    <input
                        type="email"
                        value={profile?.user?.email || ""}
                        readOnly
                        className={`${inputStyles} bg-secondary/40 text-secondary-foreground/70 cursor-not-allowed`}
                    />
                </div>

                {/* Student ID field container */}
                <div>
                    <label className={labelStyles}>Student ID</label>
                    <input
                        type="text"
                        value={form.studentId}
                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                        className={inputStyles}
                        placeholder="00-0000-000"
                    />
                </div>

                {/* Account Role dynamic multi-select box container */}
                <div>
                    <label className={labelStyles}>Account Role</label>
                    <div className="flex flex-wrap gap-1.5">
                        {Object.values(ROLES).map((r) => {
                            const isSelected = form.role === r;
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r as any })}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                                        isSelected
                                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                                            : "border-border bg-card text-secondary-foreground/80 hover:bg-secondary/50"
                                    }`}
                                >
                                    {isSelected && <Check size={12} strokeWidth={2.5} />}
                                    <span>{r}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Micro Action Layout footer separation */}
            <div className="pt-4 flex items-center justify-between border-t border-border mt-1">
                <div className="min-h-[16px] flex items-center">
                    {hasChanges && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-500 font-medium">
                            <span className="h-1.5 w-1.5 rounded-sm bg-orange-500" />
                            <span>Unsaved changes</span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={logout}
                        className="px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent/80 rounded-md transition-colors"
                    >
                        Sign Out
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile || !hasChanges}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            hasChanges 
                                ? "bg-orange-500 text-white hover:bg-orange-600" 
                                : "bg-secondary text-secondary-foreground/40 cursor-not-allowed"
                        }`}
                    >
                        {isUpdatingProfile ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}