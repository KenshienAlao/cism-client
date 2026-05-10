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
            className={`flex flex-col p-5 md:p-8 text-left border-2 w-full ${
                active ? 'border-orange-500 bg-white' : 'border-neutral-200 bg-neutral-50'
            }`}
        >
            <Icon className={`w-6 h-6 md:w-8 md:h-8 mb-5 md:mb-7 ${active ? 'text-orange-500' : 'text-neutral-300'}`} />
            <div className="space-y-1">
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] block ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
                    {label}
                </span>
                <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest block ${active ? 'text-orange-500' : 'text-neutral-300'}`}>
                    {subtitle}
                </p>
            </div>
        </button>
    );
}
