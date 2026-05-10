interface OptionCardProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    subtitle: string;
}

export function OptionCard({ active, onClick, icon: Icon, label, subtitle }: OptionCardProps) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col p-6 md:p-10 text-left border transition-all duration-300 ${active
                ? 'border-orange-500 bg-white ring-1 ring-orange-500 shadow-sm'
                : 'border-neutral-200 bg-neutral-50/50'
                }`}
        >
            <Icon className={`w-6 h-6 md:w-10 md:h-10 mb-6 md:mb-10 ${active ? 'text-orange-500' : 'text-neutral-300'}`} />
            <div className="space-y-2 md:space-y-3">
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.4em] block ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {label}
                </span>
                <p className={`text-[9px] md:text-xs font-bold uppercase tracking-widest block leading-relaxed ${active ? 'text-orange-500' : 'text-neutral-300'}`}>
                    {subtitle}
                </p>
            </div>
        </button>
    );
}
