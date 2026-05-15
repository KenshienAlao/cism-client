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
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center transition-colors bg-card border border-border rounded-md ${className}`}>
      <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center border border-border mb-4">
        <Icon className="w-4 h-4 text-accent-foreground" />
      </div>
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
        {title}
      </h3>
      <p className="text-[11px] font-medium text-muted-foreground max-w-[220px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}