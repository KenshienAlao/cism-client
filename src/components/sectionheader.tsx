"use client";

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onViewAll?: () => void;
}

export function SectionHeader({ icon, title, subtitle, onViewAll }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
                {icon && (
                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center border border-border text-secondary-foreground shrink-0 select-none">
                        {icon}
                    </div>
                )}
                
                <div className="flex flex-col min-w-0">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight truncate">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-secondary-foreground/70 truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {onViewAll && (
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onViewAll}
                    className="flex items-center gap-1 py-1 px-2 rounded-md bg-secondary text-secondary-foreground hover:text-orange-500 border border-transparent active:border-border transition-colors shrink-0"
                >
                    <span className="text-[11px] font-medium tracking-tight">
                        View all
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                </motion.button>
            )}
        </div>
    );
}