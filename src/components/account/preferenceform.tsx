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

    const labelStyles = "text-[10px] font-bold text-muted-foreground uppercase tracking-widest";

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Theme Selection */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded bg-accent/50">
                        <Monitor size={14} className="text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                        Appearance
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {options.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;

                        return (
                            <button
                                key={opt.id}
                                onClick={() => setTheme(opt.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-left outline-none focus:ring-1 focus:ring-primary ${
                                    isActive 
                                    ? 'border-primary bg-accent text-accent-foreground' 
                                    : 'border-border bg-card text-muted-foreground hover:border-muted hover:text-foreground'
                                }`}
                            >
                                <Icon size={16} className={isActive ? 'text-primary' : 'inherit'} />
                                
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                        {opt.label}
                                    </span>
                                    {isActive && <Check size={12} className="text-primary" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Note Section */}
            <footer className="pt-4">
                <div className="bg-secondary/30 border border-border/50 rounded-md p-4">
                    <div className="flex gap-3">
                        <div className="h-1 w-1 rounded-full bg-muted mt-1.5 shrink-0" />
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-wide">
                            Theme preferences are stored locally and synchronized with your browser settings. 
                            Changes take effect immediately across all open tabs.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}