import { ReactNode } from 'react';

interface CheckoutSectionProps {
    icon: React.ElementType;
    color: string;
    title: string;
    badge?: string;
    right?: ReactNode;
    children: ReactNode;
}

export function CheckoutSection({ icon: Icon, color, title, badge, right, children }: CheckoutSectionProps) {
    return (
        <section className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Header Area */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${color.includes('orange-500') ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <h2 className="text-sm font-medium text-foreground">{title}</h2>
                
                {badge && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        badge.toLowerCase() === 'required' 
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' 
                            : 'bg-secondary border-border text-muted-foreground'
                    }`}>
                        {badge}
                    </span>
                )}
                
                {right && <div className="ml-auto text-sm">{right}</div>}
            </div>

            {/* Content Area */}
            <div className="p-4">{children}</div>
        </section>
    );
}