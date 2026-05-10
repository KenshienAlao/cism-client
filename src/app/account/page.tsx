"use client";
import { useAuth } from "@/hooks/use-auth";
import { MoveLeft, LogOut } from "lucide-react";
import Loading from "@/components/ui/loading";
import Link from "next/link";
import { AccountSidebar } from "@/components/account/accountsidebar";
import { ProfileForm } from "@/components/account/profileform";
import { AvatarUpload } from "@/components/account/avatarupload";
import { DangerZone } from "@/components/account/dangerzone";

export default function Page() {
    const { profile, isLoading, logout } = useAuth();

    if (isLoading || !profile) return <Loading />;

    return (
        <main className="min-h-screen bg-neutral-50 font-sans text-neutral-900 pb-20 md:pb-0">
            <div className="mx-auto flex max-w-6xl flex-col md:flex-row gap-6 px-4 py-6 md:py-10">
                <AccountSidebar />

                <div className="flex-1 space-y-6">
                    <section className="bg-white border border-neutral-100 p-6 md:p-8">
                        <div className="mb-8 border-b border-neutral-50 pb-5">
                            <h2 className="text-xl font-bold tracking-tight">My Profile</h2>
                            <p className="text-xs font-medium text-neutral-400 mt-1 uppercase tracking-wider">Account security & personal info</p>
                        </div>

                        <div className="flex flex-col gap-10 lg:flex-row">
                            <ProfileForm />
                            <AvatarUpload />
                        </div>
                    </section>

                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-3 border border-neutral-100 bg-white py-4 text-xs font-bold text-neutral-900 uppercase tracking-widest transition-colors active:bg-neutral-50 md:hidden"
                    >
                        <LogOut size={16} className="text-orange-500" /> Logout
                    </button>

                    <DangerZone />
                </div>
            </div>  
        </main>
    );
}