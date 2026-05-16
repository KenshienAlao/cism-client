'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useItem } from '@/hooks/use-item';
import { ProductGrid } from '@/components/productgrid';
import { enrichStall } from '@/hooks/use-enriched-items';
import Loading from '@/components/ui/loading';
import { motion } from 'framer-motion';
import {
    Store,
    LayoutGrid,
} from 'lucide-react';

import { useGlobalChat } from '@/provider/chat-provider';
import { StallProfile } from '@/components/stall/stall-profile';
import { NavTabs } from '@/components/stall/nav-tabs';
import { useAuth } from '@/hooks/use-auth';

const fadeInVariant = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

function StallContent() {
    const { isLoading: isAuthLoading } = useAuth();
    const { openChat } = useGlobalChat();
    const searchParams = useSearchParams();
    const router = useRouter();
    const stallName = searchParams.get('name');
    const { items: allStalls, isLoading } = useItem();
    const search = searchParams.get('q') || "";

    const [activeTab, setActiveTab] = useState<string>('All Products');

    const stall = useMemo(() => {
        if (!allStalls || !stallName) return null;
        return allStalls.find(s => s.name.toLowerCase() === stallName.toLowerCase());
    }, [allStalls, stallName]);

    const categories = useMemo(() => {
        if (!stall) return [];
        const cats = new Set(stall.items.map(item => item.category).filter((c): c is string => Boolean(c)));
        return ['All Products', ...Array.from(cats)];
    }, [stall]);



    if (isAuthLoading || isLoading) return <Loading />;

    if (!stall) {
        return (
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInVariant}
                className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center"
            >
                <div className="w-16 h-16 bg-card border border-border rounded-lg flex items-center justify-center mb-4">
                    <Store className="w-6 h-6 text-orange-500" />
                </div>
                <h1 className="text-base font-bold text-foreground mb-1">Stall Not Found</h1>
                <p className="text-sm text-foreground/70 mb-4 max-w-xs">
                    This stall may have been renamed or removed.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    Back to Market
                </button>
            </motion.div>
        );
    }

    const filteredItems = enrichStall(stall).filter(item => {
        const searchMatch = !search.trim() || item.name?.toUpperCase().includes(search.toUpperCase()) || item.category?.toUpperCase().includes(search.toUpperCase());
        const tabMatch = activeTab === 'All Products' || item.category === activeTab;
        return searchMatch && tabMatch;
    });

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInVariant}
            className="min-h-screen bg-background text-foreground antialiased"
        >

            <main className="max-w-7xl mx-auto p-4 md:p-5 flex flex-col gap-3">
                {/* Profile Section */}
                <div className="bg-card border border-border rounded-lg p-0 overflow-hidden shadow-sm">
                    <StallProfile stall={stall} openChat={openChat} />
                </div>

                {/* Filter and Navigation Area */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-5 flex flex-col gap-3">
                    <NavTabs tabs={categories} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Product Section Wrapper */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-5">
                    {filteredItems.length > 0 ? (
                        <ProductGrid items={filteredItems} />
                    ) : (
                        <div className="p-5 flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5 text-foreground/40" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">No Products Found</h3>
                                <p className="text-sm text-foreground/60 max-w-xs mt-1">
                                    {stall.items.length === 0 
                                        ? "This stall hasn't listed any items for sale yet." 
                                        : "No items match your active tab filter criteria."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </motion.div>
    );
}

export default function StallPage() {
    return (
        <Suspense fallback={<Loading />}>
            <StallContent />
        </Suspense>
    );
}