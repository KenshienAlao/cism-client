import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export function Emptystatetab({ 
    title, 
    description, 
    icon: Icon, 
    actionLabel, 
    actionHref,
    className = "min-h-screen bg-neutral-50"
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 flex items-center justify-center mb-8">
                <Icon className="w-10 h-10 text-neutral-200" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">{title}</h1>
            <p className="text-neutral-400 text-sm mb-12 max-w-xs leading-relaxed">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="px-12 py-5 bg-orange-500 text-white font-semibold uppercase text-xs tracking-widest transition-colors hover:bg-orange-600"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    )
}