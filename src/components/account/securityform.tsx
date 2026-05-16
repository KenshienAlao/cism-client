"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { notifError } from "@/lib/toast";
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { DangerZone } from "./dangerzone";

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

    const inputStyles = "w-full bg-input border border-border rounded-md pl-3 pr-9 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder:text-secondary-foreground/40";
    const labelStyles = "text-xs font-medium text-foreground mb-1.5 block";
    const sectionHeaderStyles = "flex items-center gap-2 border-b border-border pb-2 mb-4";
    const sectionTitleStyles = "text-sm font-medium text-foreground";
    const actionBtnStyles = "px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500";

    const isEmailFormValid = emailForm.newEmail && emailForm.password;
    const isPassFormValid = passForm.oldPassword && passForm.newPassword && passForm.confirmPassword;

    return (
        <div className="space-y-8 w-full">
            {/* Email Section */}
            <section>
                <div className={sectionHeaderStyles}>
                    <Mail size={15} className="text-orange-500" />
                    <h3 className={sectionTitleStyles}>Email Address</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div>
                        <label className={labelStyles}>New Email Address</label>
                        <input
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                            className={inputStyles.replace("pr-9", "pr-3")}
                            placeholder="new.email@example.com"
                        />
                    </div>

                    <div>
                        <label className={labelStyles}>Current Password</label>
                        <input
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                            className={inputStyles.replace("pr-9", "pr-3")}
                            placeholder="Verify identity"
                        />
                    </div>

                    <div className="sm:col-span-2 flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={handleEmailUpdate}
                            disabled={isChangingEmail || !isEmailFormValid}
                            className={`${actionBtnStyles} ${
                                isEmailFormValid && !isChangingEmail
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "bg-secondary text-secondary-foreground/40 cursor-not-allowed"
                            }`}
                        >
                            {isChangingEmail ? "Updating..." : "Update email"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Password Section */}
            <section>
                <div className={sectionHeaderStyles}>
                    <Lock size={15} className="text-orange-500" />
                    <h3 className={sectionTitleStyles}>Password Update</h3>
                </div>

                <div className="space-y-3">
                    <div>
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
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-foreground/60 hover:text-foreground focus:outline-none transition-colors"
                                type="button"
                            >
                                {showPass.old ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
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
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-foreground/60 hover:text-foreground focus:outline-none transition-colors"
                                    type="button"
                                >
                                    {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <div>
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
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-foreground/60 hover:text-foreground focus:outline-none transition-colors"
                                    type="button"
                                >
                                    {showPass.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={handlePasswordUpdate}
                            disabled={isChangingPassword || !isPassFormValid}
                            className={`${actionBtnStyles} ${
                                isPassFormValid && !isChangingPassword
                                    ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "bg-secondary text-secondary-foreground/40 cursor-not-allowed"
                            }`}
                        >
                            {isChangingPassword ? "Updating..." : "Update password"}
                        </button>
                    </div>
                </div>
            </section>
                
            {/* Danger Zone Section */}
            <section className="pt-2">
                <div className={sectionHeaderStyles.replace("border-b", "border-b border-border/60")}>
                    <AlertTriangle size={15} className="text-red-500" />
                    <h3 className={`${sectionTitleStyles} text-red-500`}>Danger Zone</h3>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 rounded-md p-3.5">
                    <DangerZone />
                </div>
            </section>
        </div>
    );
}