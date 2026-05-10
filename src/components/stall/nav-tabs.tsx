interface NavTabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function NavTabs({ tabs, activeTab, onTabChange }: NavTabsProps) {
    return (
        <div className="sticky top-20 z-40 bg-neutral-50/90 backdrop-blur-xl pt-4 pb-4">
            <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                            activeTab === tab
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white'
                        }`}
                    >
                        {tab.replace('_', ' ')}
                    </button>
                ))}
            </div>
        </div>
    );
}