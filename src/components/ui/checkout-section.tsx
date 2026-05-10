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
        <section className="bg-white border border-neutral-100 shadow-sm animate-in fade-in duration-500">
            {/* Manifest Header */}
            <div className="px-6 py-5 md:px-10 md:py-6 border-b border-neutral-50 flex items-center gap-4 bg-neutral-50/10">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${color}`} />
                <h2 className="text-[11px] md:text-xs font-black text-neutral-900 uppercase tracking-[0.3em]">{title}</h2>
                {badge && (
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-2 py-0.5 bg-neutral-100 border border-neutral-200">
                        {badge}
                    </span>
                )}
                {right && <div className="ml-auto">{right}</div>}
            </div>

            {/* Manifest Content */}
            <div className="p-6 md:p-10">{children}</div>
        </section>
    );
}
