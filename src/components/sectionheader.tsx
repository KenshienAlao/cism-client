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
            <div className="flex items-center gap-2">
                {icon}
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
            {onViewAll && (
                <button
                    onClick={onViewAll}
                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                    View All
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
