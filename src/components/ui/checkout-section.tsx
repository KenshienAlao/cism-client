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
        <section className="smart-card">
            <div className="smart-header">
                <Icon className={`w-4 h-4 ${color}`} />
                <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">{title}</h2>
                {badge && <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{badge}</span>}
                {right && <div className="ml-auto">{right}</div>}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}
