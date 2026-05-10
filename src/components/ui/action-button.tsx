'use client';

export function ActionButton({ children, onClick, variant = 'primary', icon: Icon, iconClassName = "w-3.5 h-3.5", disabled }: any) {
    const variants: any = {
        primary: "bg-orange-500 text-white",
        ghost: "bg-neutral-50 text-neutral-500",
        emerald: "bg-emerald-500 text-white",
        dark: "bg-neutral-900 text-white",
        neutral: "bg-neutral-500 text-white",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`h-12 px-6 text-[12px] ring-2 ring-gray-300 font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 ${variants[variant]}`}
        >
            {Icon && <Icon className={iconClassName} />}
            {children}
        </button>
    );
}
