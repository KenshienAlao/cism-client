interface TabsProps {
    TABS: readonly string[];
    activeTab: string;
    setActiveTab: (tab: any) => void;
    orders: any[];
}

export default function Tabs({ TABS, activeTab, setActiveTab, orders }: TabsProps) {
    return (
        <div className="max-w-2xl mx-auto flex items-center min-w-max px-2">
            {TABS.map((tab) => {
                const isActive = activeTab === tab;
                const count = orders.filter(o => o.status.toUpperCase() === tab).length;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-5 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${isActive ? 'text-orange-500' : 'text-neutral-400'}`}
                    >
                        <span>{tab.replace('_', ' ')}</span>
                        {count > 0 && (
                            <span className={`text-[9px] font-bold ${isActive ? 'text-orange-500' : 'text-neutral-300'}`}>
                                ({count})   
                            </span>
                        )}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                        )}
                    </button>
                );
            })}
        </div>
    )
}