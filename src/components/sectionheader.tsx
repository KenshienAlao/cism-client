import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    onViewAll?: () => void;
}

export function SectionHeader({ icon, title, subtitle, onViewAll }: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-neutral-50 flex items-center justify-center border border-neutral-100">
                    {icon}
                </div>
                <div>
                    <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-widest leading-none mb-1">{title}</h2>
                    {subtitle && <p className="text-[10px] font-medium text-neutral-400">{subtitle}</p>}
                </div>
            </div>
            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-widest active:text-orange-600 transition-colors"
                >
                    View All
                    <ChevronRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
