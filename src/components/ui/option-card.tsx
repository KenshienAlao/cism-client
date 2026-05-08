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
            className={`flex flex-col p-4 rounded-xl text-left transition-all ${active
                    ? 'border-2 border-orange-500 bg-orange-50/20'
                    : 'border border-neutral-500 opacity-40 hover:opacity-70'
                }`}
        >
            <Icon className={`w-4 h-4 mb-2 ${active ? 'text-orange-500' : 'text-neutral-500'}`} />
            <span className={`text-xs font-bold ${active ? 'text-neutral-900' : 'text-neutral-500'}`}>{label}</span>
            <span className={`text-[10px] mt-0.5 ${active ? 'text-neutral-400' : 'text-neutral-500'}`}>{subtitle}</span>
        </button>
    );
}
