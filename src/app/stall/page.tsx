'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useItem } from '@/hooks/use-item';
import { useCart } from '@/hooks/use-cart';
import { Avatar } from '@/components/ui/avatar';
import { ProductGrid } from '@/components/productgrid';
import { enrichStall } from '@/hooks/use-enriched-items';
import Loading from '@/components/ui/loading';
import {
    Star,
    Clock,
    MessageCircle,
    UserPlus,
    Store,
    ShoppingBag,
    LayoutGrid,
    Calendar,
    ArrowLeft
} from 'lucide-react';


import { formatTime } from '@/lib/utils/formatTime';
import { formatDate } from '@/lib/utils/formatDate';
import { useGlobalChat } from '@/provider/chat-provider';
import { StallProfile } from '@/components/stall/stall-profile';
import { NavTabs } from '@/components/stall/nav-tabs';

function StallContent() {
    const { openChat } = useGlobalChat();
    const searchParams = useSearchParams();
    const router = useRouter();
    const stallName = searchParams.get('name');
    const { items: allStalls, isLoading } = useItem();
    const { addToCart } = useCart();
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

    const stats = useMemo(() => {
        if (!stall) return null;

        const ratingCount = stall.reviews.length;
        const avgRating = ratingCount > 0
            ? stall.reviews.reduce((acc, r) => acc + r.star, 0) / ratingCount
            : 0;


        return {
            avgRating,
            ratingCount,
            productCount: stall.items.length,
            joined: formatDate(stall.createdAt),
            open: formatTime(stall.openAt),
            close: formatTime(stall.closeAt)
        };
    }, [stall]);
    if (isLoading) return <Loading />;

    if (!stall) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-neutral-100 flex items-center justify-center mb-8 hover:scale-105 transition-transform duration-300">
                    <Store className="w-10 h-10 text-neutral-300" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3 tracking-tight">Stall Not Found</h1>
                <p className="text-base text-neutral-500 mb-10 max-w-md leading-relaxed">
                    We couldn't find the stall you're looking for. It might have changed its name or been removed.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-8 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/20 transition-all text-sm tracking-wide"
                >
                    Back to Market
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Stall Profile Card */}
                <StallProfile stall={stall} openChat={openChat} />
                {/* Navigation Tabs */}
                <NavTabs tabs={categories} activeTab={activeTab} onTabChange={setActiveTab} />
                {/* product */}
                <ProductGrid
                    items={enrichStall(stall).filter(item => {
                        const searchMatch = !search.trim() || item.name?.toUpperCase().includes(search.toUpperCase()) || item.category?.toUpperCase().includes(search.toUpperCase());
                        const tabMatch = activeTab === 'All Products' || item.category === activeTab;
                        return searchMatch && tabMatch;
                    })}
                />

                {
                    stall.items.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-white rounded-3xl border border-neutral-100 shadow-sm transition-all hover:shadow-md">
                            <div className="w-20 h-20 bg-neutral-50 rounded-3xl flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-300">
                                <LayoutGrid className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-2xl font-extrabold text-neutral-900 mb-2">No Products Yet</h3>
                            <p className="text-base text-neutral-500 max-w-sm">This stall hasn't listed any items for sale. Check back later.</p>
                        </div>
                    )
                }
            </main >
            <div className="h-24" />
        </div >
    );
}

export default function StallPage() {
    return (
        <Suspense fallback={<Loading />}>
            <StallContent />
        </Suspense>
    );
}
