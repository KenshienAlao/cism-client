"use client";

import { useTheme } from "@/provider/theme-provider";
import { Sun, Moon, Monitor, Check } from "lucide-react";

export function PreferenceForm() {
    const { theme, setTheme } = useTheme();

    const options = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ] as const;

    const sectionHeaderStyles = "flex items-center gap-2 border-b border-border pb-2 mb-4";
    const sectionTitleStyles = "text-sm font-medium text-foreground";

    return (
        <div className="space-y-6 w-full max-w-xl">
            {/* Theme Selection Section */}
            <section>
                <div className={sectionHeaderStyles}>
                    <Monitor size={15} className="text-orange-500" />
                    <h3 className={sectionTitleStyles}>Appearance</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {options.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setTheme(opt.id)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-left outline-none transition-colors focus:ring-1 focus:ring-orange-500 ${
                                    isActive 
                                        ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                                        : 'border-border bg-card text-secondary-foreground/80 hover:bg-secondary/50'
                                }`}
                            >
                                <Icon size={15} className={isActive ? 'text-orange-500' : 'text-secondary-foreground/70'} />
                                
                                <div className="flex-1 flex items-center justify-between min-w-0">
                                    <span className="text-xs font-medium truncate">
                                        {opt.label}
                                    </span>
                                    {isActive && <Check size={13} strokeWidth={2.5} className="text-orange-500 shrink-0" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}