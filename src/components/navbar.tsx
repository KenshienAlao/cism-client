import { Bell, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";


export default function Navbar({ placeholder }: { placeholder: string }) {
    const { profile } = useAuth();
    return (
        <div className="mx-auto flex h-full max-w-xl items-center justify-center gap-3 px-1">
            <div className="flex flex-1 items-center gap-2.5 bg-neutral-50 px-3.5 py-2 rounded-md border border-neutral-100 focus-within:bg-white focus-within:border-orange-500/30 transition-colors">
                <Search size={14} className="text-neutral-300" />
                <input
                    placeholder={placeholder}
                    className="w-full bg-transparent text-[11px] font-bold uppercase tracking-widest text-neutral-900 outline-none placeholder:text-neutral-300 placeholder:font-medium"
                />
            </div>

            <div className="flex items-center gap-1.5">
                <Link
                    href="/notifications"
                    className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 active:bg-neutral-50 transition-colors"
                >
                    <Bell size={18} strokeWidth={2} />
                </Link>

                <Link
                    href="/account"
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-neutral-100 text-[10px] font-bold uppercase tracking-widest text-neutral-900 border border-neutral-200 active:bg-neutral-200 transition-colors"
                >
                    {profile?.user?.avatar ? (
                        <img src={profile.user.avatar} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                        profile?.user?.clientName?.slice(0, 2) || "??"
                    )}
                </Link>
            </div>
        </div>
    );
}   