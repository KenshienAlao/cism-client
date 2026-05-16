"use client";

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className = "" }: EmptyStateProps) {
  return (
    <div 
      className={`
        flex 
        flex-col 
        items-center 
        justify-center 
        p-6 
        text-center 
        bg-card 
        w-full
        ${className}
      `.trim()}
    >
      <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center border border-border mb-2.5 select-none shrink-0">
        <Icon className="w-4 h-4 text-secondary-foreground/80" />
      </div>
      <h3 className="text-xs font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h3> 
      <p className="text-[11px] text-secondary-foreground/70 max-w-[200px] leading-normal font-normal">
        {description}
      </p>
    </div>
  );
}