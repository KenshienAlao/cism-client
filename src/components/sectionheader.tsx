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
        <div className="flex items-start justify-between mb-4 px-0.5">
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="mt-0.5 w-9 h-9 rounded-lg bg-neutral-50 flex items-center justify-center border border-neutral-100 text-neutral-600 transition-colors duration-200 group-hover:border-orange-200">
                        {icon}
                    </div>
                )}
                
                <div className="flex flex-col space-y-0.5">
                    <h2 className="text-sm font-bold text-neutral-800 tracking-tight leading-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-[11px] font-medium text-neutral-500 leading-none tracking-normal">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="group flex items-center gap-1 py-1 px-2 -mr-2 rounded-md hover:bg-orange-50 transition-all duration-200"
                >
                    <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">
                        View All
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
            )}
        </div>
    );
}