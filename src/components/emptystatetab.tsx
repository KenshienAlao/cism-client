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
    className = "min-h-[200px] bg-background"
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-5 text-center gap-3 ${className}`}>
            <div className="bg-secondary border border-border rounded-lg p-4 flex items-center justify-center">
                <Icon className="w-5 h-5 text-secondary-foreground/60" />
            </div>
            
            <div className="space-y-1 max-w-xs">
                <h2 className="text-base font-medium text-foreground">{title}</h2>
                <p className="text-sm text-secondary-foreground/70">
                    {description}
                </p>
            </div>
            
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="mt-3 px-5 py-2 bg-orange-500 text-white text-sm font-medium rounded-md transition-colors duration-150 hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}