import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/auth.context";
import Link from "next/link";


export default function Navbar({ placeholder }: { placeholder: string }) {
    const { profile } = useAuth();
    return (
        <div className="mx-auto flex h-full max-w-xl items-center justify-center gap-4">
            <div className="group flex flex-1 items-center gap-3 rounded-full bg-neutral-50 px-4 py-2 ring-1 ring-neutral-100 transition-all duration-300 focus-within:bg-white focus-within:ring-neutral-900 focus-within:shadow-lg focus-within:shadow-neutral-900/5">
                <Search size={14} className="text-neutral-400 transition-colors group-focus-within:text-neutral-900" />
                <input
                    placeholder={placeholder}
                    className="w-full bg-transparent text-[11px] font-medium tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400"
                />
            </div>

            <div className="flex items-center gap-1">
                <button className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
                    <Bell size={18} strokeWidth={1.5} />
                </button>
                <Link href="/account" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-[10px] font-bold uppercase tracking-tighter text-neutral-900 ring-1 ring-neutral-200">
                    {profile?.user.avatar ? <img src={profile.user.avatar} alt="avatar" className="h-full w-full object-cover" /> : profile?.user.username.slice(0, 2)}
                </Link>
            </div>
        </div>
    );
}