"use client";

import { useAuth } from "@/hooks/use-auth";
import { useConfirmation } from "@/context/confirmation.context";

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                    Delete account
                </h4>
                <p className="text-xs text-secondary-foreground/60 max-w-md leading-normal">
                    Permanently remove your account profile and all associated data. This action is completely irreversible.
                </p>
            </div>
            
            <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="sm:w-auto px-3 py-1.5 rounded-md border border-red-500/20 bg-card text-xs font-medium text-red-500 hover:bg-red-500/10 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap self-start sm:self-center"
            >
                {isDeletingAccount ? "Deleting..." : "Delete account"}
            </button>
        </div>
    );
}