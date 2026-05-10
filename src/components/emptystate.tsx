import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-white border border-neutral-100 rounded-md ${className}`}>
      <div className="w-12 h-12 bg-neutral-50 rounded-md flex items-center justify-center border border-neutral-100 mb-5">
        <Icon className="w-5 h-5 text-neutral-200" />
      </div>
      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-[10px] font-medium text-neutral-400 max-w-[200px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
