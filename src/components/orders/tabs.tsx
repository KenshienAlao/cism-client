interface TabsProps {
    TABS: readonly string[];
    activeTab: string;
    setActiveTab: (tab: any) => void;
    orders: any[];
}

export default function Tabs({ TABS, activeTab, setActiveTab, orders }: TabsProps) {
    return (
        <div className="w-full overflow-x-auto scrollbar-none md:flex md:justify-center bg-neutral-50">
            <div className="max-w-4xl mx-auto flex items-center min-w-max px-4 md:px-8 border-b border-neutral-200">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    const count = orders.filter(o => o.status.toUpperCase() === tab).length;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 md:px-6 py-3 md:py-5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 shrink-0 ${isActive ? 'text-orange-500' : 'text-neutral-400'}`}
                        >
                            <span>{tab.replace('_', ' ')}</span>
                            {count > 0 && (
                                <span className={`text-[9px] md:text-[10px] font-black tabular-nums ${isActive ? 'text-orange-500' : 'text-neutral-300'}`}>
                                    {count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}