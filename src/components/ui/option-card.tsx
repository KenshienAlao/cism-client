interface OptionCardProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    subtitle: string;
    className?: string;
}

export function OptionCard({ active, onClick, icon: Icon, label, subtitle, className }: OptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col text-left w-full p-4 border rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${
                active 
                    ? 'border-orange-500 bg-secondary' 
                    : 'border-border bg-card hover:bg-secondary/50'
            } ${className || ''}`}
        >
            <Icon className={`w-5 h-5 mb-2 transition-colors ${active ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground block">
                    {label}
                </span>
                <p className={`text-xs block transition-colors ${active ? 'text-orange-500' : 'text-muted-foreground'}`}>
                    {subtitle}
                </p>
            </div>
        </button>
    );
}