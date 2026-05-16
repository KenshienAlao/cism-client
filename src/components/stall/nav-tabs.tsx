interface NavTabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function NavTabs({ tabs, activeTab, onTabChange }: NavTabsProps) {
    return (
        <div className="sticky top-0 z-40 bg-card border-b border-border">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-ring ${
                            activeTab === tab
                                ? 'bg-orange-500 text-white font-bold'
                                : 'text-foreground/70 bg-secondary hover:text-foreground'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>
        </div>
    );
}