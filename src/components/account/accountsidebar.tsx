"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";

export function AccountSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
    const { logout } = useAuth();

    return (
        <aside className="hidden w-56 shrink-0 md:block">
            <nav className="flex flex-col gap-1">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Settings
                </p>

                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`group flex items-center gap-3 border-l-2 py-2.5 pl-3 pr-2 text-sm font-medium transition-all ${
                        activeTab === 'profile' 
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-500/10 text-neutral-900 dark:text-orange-500' 
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                >
                    <User size={16} className={activeTab === 'profile' ? 'text-orange-500' : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'} />
                    <span>Profile Details</span>
                </button>

                <button 
                    onClick={() => setActiveTab('security')}
                    className={`group flex items-center gap-3 border-l-2 py-2.5 pl-3 pr-2 text-sm font-medium transition-all ${
                        activeTab === 'security' 
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-500/10 text-neutral-900 dark:text-orange-500' 
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                >
                    <ShieldCheck size={16} className={activeTab === 'security' ? 'text-orange-500' : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'} />
                    <span>Security</span>
                </button>

                <button 
                    onClick={() => setActiveTab('preferences')}
                    className={`group flex items-center gap-3 border-l-2 py-2.5 pl-3 pr-2 text-sm font-medium transition-all ${
                        activeTab === 'preferences' 
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-500/10 text-neutral-900 dark:text-orange-500' 
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                >
                    <Settings size={16} className={activeTab === 'preferences' ? 'text-orange-500' : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'} />
                    <span>Preferences</span>
                </button>

                <div className="my-4 border-t border-neutral-100 dark:border-neutral-800 mx-3" />

                <button 
                    onClick={logout} 
                    className="group flex items-center gap-3 border-l-2 border-transparent py-2.5 pl-3 pr-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut size={16} className="text-neutral-400 dark:text-neutral-600 group-hover:text-red-500 dark:group-hover:text-red-400" />
                    <span>Sign Out</span>
                </button>
            </nav>
        </aside>
    );
}