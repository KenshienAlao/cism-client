"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, ShieldCheck, Settings } from "lucide-react";
import Loading from "@/components/ui/loading";
import { ProfileForm } from "@/components/account/profileform";
import { AvatarUpload } from "@/components/account/avatarupload";
import { SecurityForm } from "@/components/account/securityform";
import { PreferenceForm } from "@/components/account/preferenceform";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountPage() {
    const { profile, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

    if (isLoading || !profile) return <Loading />;

    const navigationItems = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'security' as const, label: 'Security', icon: ShieldCheck },
        { id: 'preferences' as const, label: 'Preferences', icon: Settings },
    ];

    return (
        <main className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200 selection:bg-orange-500 selection:text-white">
            <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
                
                {/* Info */}
                <header className="mb-5 flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <h1 className="text-base font-medium tracking-tight">Account Settings</h1>
                        <p className="text-xs text-secondary-foreground/60 mt-0.5">
                            Manage your profile identity, security parameters, and options.
                        </p>
                    </div>
                </header>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
                    
                    {/* Navigation Sidebar */}
                    <aside className="w-full md:col-span-1">
                        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none border-b border-border md:border-b-0">
                            {navigationItems.map((tab) => {
                                const IsActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-orange-500 relative flex-1 md:flex-none ${
                                            IsActive 
                                                ? 'bg-orange-500 text-white font-semibold' 
                                                : 'text-secondary-foreground hover:bg-secondary/60'
                                        }`}
                                    >
                                        <tab.icon size={15} className={IsActive ? 'text-white' : 'text-secondary-foreground/80'} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* View Panel */}
                    <div className="md:col-span-3">
                        <div className="bg-card border border-border rounded-lg overflow-hidden p-4 md:p-5">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.12, ease: "easeInOut" }}
                                >
                                    {activeTab === 'profile' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                            {/* Sub-form*/}
                                            <div className="lg:col-span-8 order-2 lg:order-1">
                                                <ProfileForm logout={logout} />
                                            </div>
                                            
                                            {/* Avatar */}
                                            <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center lg:items-stretch lg:pl-5 lg:border-l border-border gap-3">
                                                <div>
                                                    <h3 className="text-xs font-medium text-foreground">Profile Image</h3>
                                                    <p className="text-[11px] text-secondary-foreground/60 hidden lg:block mt-0.5">Square JPG or PNG formats only.</p>
                                                </div>
                                                <div className="flex justify-center lg:justify-start w-full">
                                                    <AvatarUpload />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="w-full">
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-foreground">Security Credentials</h3>
                                                <p className="text-xs text-secondary-foreground/60 mt-0.5">Update access controls and authentication factors.</p>
                                            </div>
                                            <SecurityForm />
                                        </div>
                                    )}
                                    
                                    {activeTab === 'preferences' && (
                                        <div className="w-full">
                                            <div className="mb-4">
                                                <h3 className="text-sm font-medium text-foreground">System Preferences</h3>
                                                    <p className="text-xs text-secondary-foreground/60 mt-0.5">Configure regional variables and localized configurations.</p>
                                            </div>
                                            <PreferenceForm />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>  
        </main>
    );
}   