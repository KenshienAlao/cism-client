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
        <main className="min-h-screen bg-[#F5F5F5] font-sans text-neutral-800">
            <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
                    <Link href="/" className="flex items-center gap-2 text-sm text-neutral-800">
                        <MoveLeft size={16} />
                    </Link>
                    <span className="text-sm text-neutral-800">My Account</span>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
                <AccountSidebar />
                <div className="flex-1 space-y-6">
                    <section className="border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 border-b border-neutral-100 pb-4">
                            <h2 className="text-lg font-medium">My Profile</h2>
                            <p className="text-sm text-neutral-500">Manage and protect your account</p>
                        </div>

                        <div className="flex flex-col gap-10 md:flex-row">
                            <ProfileForm />
                            <AvatarUpload />
                        </div>
                    </section>

                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-3 border border-neutral-200 bg-white py-4 text-sm font-bold text-neutral-800 transition-all hover:bg-neutral-50 active:scale-[0.99] md:hidden"
                    >
                        <LogOut size={18} /> Logout
                    </button>

                    <DangerZone />
                </div>
            </div>
        </main>
    );
}