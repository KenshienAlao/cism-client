"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { notifError } from "@/lib/toast";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";

export function SecurityForm() {
    const { changeEmail, isChangingEmail, changePassword, isChangingPassword } = useAuth();
    
    const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
    const [passForm, setPassForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    
    const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

    const handleEmailUpdate = async () => {
        if (!emailForm.newEmail || !emailForm.password) {
            notifError("All email update fields are required");
            return;
        }
        await changeEmail(emailForm);
        setEmailForm({ newEmail: "", password: "" });
    };

    const handlePasswordUpdate = async () => {
        if (!passForm.oldPassword || !passForm.newPassword || !passForm.confirmPassword) {
            notifError("All password fields are required");
            return;
        }
        if (passForm.newPassword !== passForm.confirmPassword) {
            notifError("New passwords do not match");
            return;
        }
        if (passForm.newPassword.length < 8) {
            notifError("New password must be at least 8 characters");
            return;
        }
        await changePassword({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword });
        setPassForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    const inputStyles = "w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/40";
    const labelStyles = "text-[10px] font-bold text-muted-foreground uppercase tracking-widest";
    const sectionHeaderStyles = "flex items-center gap-2 mb-6";

    return (
        <div className="space-y-12 max-w-2xl">
            {/* Email Section */}
            <section className="space-y-6">
                <div className={sectionHeaderStyles}>
                    <div className="p-1.5 rounded bg-accent/50">
                        <Mail size={14} className="text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                        Email Address
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 gap-1.5">
                        <label className={labelStyles}>New Email Address</label>
                        <input
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                            className={inputStyles}
                            placeholder="new.email@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                        <label className={labelStyles}>Current Password</label>
                        <input
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                            className={inputStyles}
                            placeholder="Verify your identity"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleEmailUpdate}
                            disabled={isChangingEmail || !emailForm.newEmail || !emailForm.password}
                            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:bg-secondary disabled:text-secondary-foreground disabled:cursor-not-allowed"
                        >
                            {isChangingEmail ? "Processing..." : "Update Email"}
                        </button>
                    </div>
                </div>
            </section>

            <hr className="border-border/50" />

            {/* Password Section */}
            <section className="space-y-6">
                <div className={sectionHeaderStyles}>
                    <div className="p-1.5 rounded bg-accent/50">
                        <Lock size={14} className="text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                        Password Update
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 gap-1.5">
                        <label className={labelStyles}>Current Password</label>
                        <div className="relative">
                            <input
                                type={showPass.old ? "text" : "password"}
                                value={passForm.oldPassword}
                                onChange={(e) => setPassForm({ ...passForm, oldPassword: e.target.value })}
                                className={inputStyles}
                                placeholder="••••••••"
                            />
                            <button 
                                onClick={() => setShowPass({...showPass, old: !showPass.old})}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                type="button"
                            >
                                {showPass.old ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid grid-cols-1 gap-1.5">
                            <label className={labelStyles}>New Password</label>
                            <div className="relative">
                                <input
                                    type={showPass.new ? "text" : "password"}
                                    value={passForm.newPassword}
                                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                    className={inputStyles}
                                    placeholder="Min. 8 chars"
                                />
                                <button 
                                    onClick={() => setShowPass({...showPass, new: !showPass.new})}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    type="button"
                                >
                                    {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                            <label className={labelStyles}>Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPass.confirm ? "text" : "password"}
                                    value={passForm.confirmPassword}
                                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                    className={inputStyles}
                                    placeholder="••••••••"
                                />
                                <button 
                                    onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    type="button"
                                >
                                    {showPass.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handlePasswordUpdate}
                            disabled={isChangingPassword || !passForm.newPassword}
                            className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 disabled:bg-secondary disabled:text-secondary-foreground disabled:cursor-not-allowed"
                        >
                            {isChangingPassword ? "Securing..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}