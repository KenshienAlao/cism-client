"use client";

import { useAuth } from "@/hooks/use-auth";
import { useConfirmation } from "@/context/confirmation.context";

export function DangerZone() {
    const { deleteAccount, isDeletingAccount } = useAuth();
    const { showConfirmation } = useConfirmation();

    const handleDeleteAccount = () => {
        showConfirmation({
            title: "Account Deletion",
            message:
                "You are about to permanently delete your Account. This action is irreversible and all encrypted records will be lost.",
            confirmText: "Delete Account",
            type: "danger",
            onConfirm: async () => {
                await deleteAccount();
            },
        });
    };

    return (
        <section className="border border-red-100 bg-red-50/10 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-red-500">Delete Account</h3>
                    <p className="text-[12px] text-neutral-400">Once you delete your account, there is no going back.</p>
                </div>
                <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="border border-red-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                    {isDeletingAccount ? "Deleting..." : "Delete"}
                </button>
            </div>
        </section>
    );
}
