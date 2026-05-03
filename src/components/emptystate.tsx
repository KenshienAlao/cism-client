import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center bg-white/40 backdrop-blur-sm border border-gray-200/50 transition-all duration-300 group ${className}`}>
      <div className="p-5 bg-white rounded-2xl shadow-sm mb-5 transition-transform duration-300">
        <Icon className="w-10 h-10 text-gray-300 transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-[250px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
