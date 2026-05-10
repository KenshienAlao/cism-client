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
        <section className="bg-white border border-neutral-200">
            <div className="px-5 md:px-7 py-4 md:py-5 border-b border-neutral-200 flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                <h2 className="text-[10px] md:text-xs font-black text-neutral-900 uppercase tracking-[0.3em]">{title}</h2>
                {badge && (
                    <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] px-2 py-0.5 border border-neutral-200">
                        {badge}
                    </span>
                )}
                {right && <div className="ml-auto">{right}</div>}
            </div>
            <div className="p-5 md:p-7">{children}</div>
        </section>
    );
}
