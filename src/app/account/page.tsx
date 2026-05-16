"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, ShieldCheck, Settings, ChevronRight } from "lucide-react";
import Loading from "@/components/ui/loading";
import { AccountSidebar } from "@/components/account/accountsidebar";
import { ProfileForm } from "@/components/account/profileform";
import { AvatarUpload } from "@/components/account/avatarupload";
import { DangerZone } from "@/components/account/dangerzone";
import { SecurityForm } from "@/components/account/securityform";
import { PreferenceForm } from "@/components/account/preferenceform";
import { useState } from "react";

export default function AccountPage() {
    const { profile, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    if (isLoading || !profile) return <Loading />;

    return (
        <main className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground transition-colors duration-200">
            <div className="mx-auto max-w-5xl px-4 py-8 md:py-12 lg:py-16">

                {/* Header Section: Identity */}
                <header className="mb-8 flex items-center justify-between border-b border-border pb-6">
                    <button
                        onClick={logout}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-secondary transition-colors"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </header>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                    
                    {/* Navigation Sidebar */}
                    <aside className="w-full md:w-56 shrink-0">
                        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {[
                                { id: 'profile', label: 'Profile', icon: User },
                                { id: 'security', label: 'Security', icon: ShieldCheck },
                                { id: 'preferences', label: 'Preferences', icon: Settings },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-1 md:flex-none items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'bg-accent text-accent-foreground' 
                                        : 'text-secondary-foreground hover:bg-secondary'
                                    }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main */}
                    <div className="flex-1 space-y-6">
                        <section className="bg-card border border-border rounded-md overflow-hidden">
                            {/* title */}
                            <div className="bg-secondary/30 px-6 py-3 border-b border-border flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</span>
                                <ChevronRight size={10} className="text-muted-foreground" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                    {activeTab}
                                </span>
                            </div>

                            <div className="p-6 md:p-8">
                                {activeTab === 'profile' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        <div className="lg:col-span-8 order-2 lg:order-1">
                                            <ProfileForm />
                                        </div>
                                        <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center lg:items-start lg:pl-8 lg:border-l border-border/60">
                                            <h3 className="text-[11px] font-bold uppercase text-muted-foreground mb-4 tracking-wider">Avatar</h3>
                                            <AvatarUpload />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="max-w-2xl">
                                        <SecurityForm />
                                    </div>
                                )}
                                
                                {activeTab === 'preferences' && (
                                    <div className="max-w-2xl">
                                        <PreferenceForm />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Secondary Actions */}
                        <div className="space-y-4">
                            <DangerZone />
                            
                            {/* Mobile Logout (visible only on small screens) */}
                            <button
                                onClick={logout}
                                className="flex md:hidden w-full items-center justify-center gap-2 border border-border bg-card py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground active:bg-secondary transition-colors"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>  
        </main>
    );
}