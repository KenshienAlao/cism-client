"use client";

import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onViewAll?: () => void;
}

export function SectionHeader({ icon, title, subtitle, onViewAll }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center border border-border text-accent-foreground transition-colors">
                        {icon}
                    </div>
                )}
                
                <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight leading-none mb-1">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[11px] font-medium text-muted-foreground leading-none">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="group flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-accent transition-colors"
                >
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        View All
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
                </button>
            )}
        </div>
    );
}