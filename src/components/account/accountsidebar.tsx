"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export function AccountSidebar() {
    const { logout } = useAuth();

    return (
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
    );
}
