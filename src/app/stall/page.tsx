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

function StallContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const stallName = searchParams.get('name');
    const { items: allStalls, isLoading } = useItem();
    const { addToCart } = useCart();
    const search = searchParams.get('q') || "";

    const stall = useMemo(() => {
        if (!allStalls || !stallName) return null;
        return allStalls.find(s => s.name.toLowerCase() === stallName.toLowerCase());
    }, [allStalls, stallName]);

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
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                    <Store className="w-8 h-8 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">Stall Not Found</h1>
                <p className="text-neutral-500 mb-8 max-w-xs">We couldn't find the stall you're looking for. It might have changed its name or been removed.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all uppercase text-xs tracking-widest shadow-lg shadow-orange-500/20"
                >
                    Back to Market
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="relative h-32 md:h-48 bg-gradient-to-r from-orange-400/20 to-rose-400/20">
                        <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
                    </div>

                    <div className="px-6 md:px-10 pb-8 -mt-12 md:-mt-16 relative flex flex-col md:flex-row gap-6 items-start md:items-end">
                        <Avatar
                            src={stall.image}
                            name={stall.name}
                            size="xl"
                            className="ring-4 ring-white shadow-xl bg-white"
                        />

                        <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">{stall.name}</h1>
                                    {stall.status && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                            Active Now
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-neutral-500 max-w-2xl line-clamp-1">{stall.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 uppercase tracking-widest">
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Follow
                                </button>
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-50 transition-all uppercase tracking-widest">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    Chat
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 md:border-l border-neutral-100 md:pl-10 py-2">
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                                    Ratings
                                </div>
                                <div className="text-sm font-black text-neutral-900">
                                    {stats?.avgRating.toFixed(1)} <span className="text-[10px] font-medium text-neutral-400 ml-0.5">({stats?.ratingCount})</span>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <ShoppingBag className="w-3 h-3 text-orange-500" />
                                    Products
                                </div>
                                <div className="text-sm font-black text-neutral-900">{stats?.productCount}</div>
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-orange-500" />
                                    Joined
                                </div>
                                <div className="text-sm font-black text-neutral-900">{stats?.joined}</div>
                            </div>
                            <div className="space-y-0.5 hidden md:block">
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-orange-500" />
                                    Hours
                                </div>
                                <div className="text-sm font-black text-neutral-900">{stats?.open} - {stats?.close}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky top-20 z-40 bg-neutral-50/80 backdrop-blur-md pt-2 pb-4">
                    <div className="flex items-center gap-8 border-b border-black/5 px-2">
                        <button className="relative py-4 text-sm font-black text-orange-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-orange-500">
                            All Products
                        </button>
                        <button className="py-4 text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors">
                            Categories
                        </button>
                        <button className="py-4 text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors">
                            Latest
                        </button>
                    </div>
                </div>
                <ProductGrid
                    items={enrichStall(stall).filter(item => {
                        if (!search.trim()) return true;
                        const s = search.toUpperCase();
                        return item.name?.toUpperCase().includes(s) || item.category?.toUpperCase().includes(s);
                    })}
                    onAddToCart={(id) => {
                        addToCart({
                            stallId: stall.id,
                            stallItemId: Number(id),
                            variationId: 0,
                            quantity: 1
                        });
                    }}
                />

                {
                    stall.items.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <LayoutGrid className="w-6 h-6 text-neutral-200" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900">No products yet</h3>
                            <p className="text-sm text-neutral-500">This stall hasn't listed any items for sale yet.</p>
                        </div>
                    )
                }
            </main >
            <div className="h-20" />
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
