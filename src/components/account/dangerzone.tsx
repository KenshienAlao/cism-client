"use client";

import { useAuth } from "@/hooks/use-auth";
import { useConfirmation } from "@/context/confirmation.context";
import { AlertTriangle } from "lucide-react";

export function DangerZone() {
    const { deleteAccount, isDeletingAccount } = useAuth();
    const { showConfirmation } = useConfirmation();

    const handleDeleteAccount = () => {
        showConfirmation({
            title: "Permanently Delete Account",
            message:
                "This action is irreversible. All data, settings, and encrypted records associated with this account will be permanently removed.",
            confirmText: "Delete Account",
            type: "danger",
            onConfirm: async () => {
                await deleteAccount();
            },
        });
    };

    return (
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md transition-colors">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                    Security & Access
                </h3>
            </div>

            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Delete Account</p>
                    <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 max-w-md leading-relaxed">
                        Permanently remove your account and all associated data. This action cannot be undone.
                    </p>
                </div>
                
                <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="w-fit border border-red-200 dark:border-red-900/50 px-5 py-2 rounded-md text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isDeletingAccount ? "Processing..." : "Delete Account"}
                </button>
            </div>
        </section>
    );
}