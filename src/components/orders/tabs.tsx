'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TabsProps {
    TABS: readonly string[];
    activeTab: string;
    setActiveTab: (tab: any) => void;
    orders: any[];
}

export default function Tabs({ TABS, activeTab, setActiveTab, orders }: TabsProps) {
    return (
        <div className="w-full overflow-x-auto select-none no-scrollbar">
            <div className="flex items-center min-w-max gap-1">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    const count = orders.filter(o => o.status.toUpperCase() === tab).length;

                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-3 py-3.5 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                                isActive
                                    ? 'text-foreground'
                                    : 'text-secondary-foreground hover:text-foreground'
                            }`}
                        >
                            <span>{tab.replace('_', ' ')}</span>

                            <AnimatePresence initial={false}>
                                {count > 0 && (
                                    <motion.span
                                        key={`badge-${tab}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        className={`text-[11px] tabular-nums font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center transition-colors ${
                                            isActive
                                                ? 'bg-orange-500 text-background'
                                                : 'bg-secondary text-secondary-foreground'
                                        }`}
                                    >
                                        {count}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {isActive && (
                                <motion.div
                                    layoutId="tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-md"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}