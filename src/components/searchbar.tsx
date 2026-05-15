'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Store, UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { useItem } from '@/hooks/use-item';
import { useEnrichedItems } from '@/hooks/use-enriched-items';
import { useAuth } from '@/hooks/use-auth';
import { NO_NAV_ROUTES } from '@/config/app.config';
import { isPathInRoutes } from '@/lib/utils/route';
import Image from 'next/image';

interface SearchResult {
    id: string;
    name: string;
    type: 'product' | 'stall';
    score: number;
    metadata: any;
}

const RECENT_SEARCHES_KEY = 'cism_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({ placeholder = "Search...", liveSearch = false }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mounted, setMounted] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isNoNavRoute = useMemo(() => isPathInRoutes(pathname, NO_NAV_ROUTES as unknown as string[]), [pathname]);
    const isHome = pathname === '/';
    const { profile } = useAuth();
    const { items: stalls = [] } = useItem();
    const allItems = useEnrichedItems(stalls);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { setQuery(searchParams.get('q') || ''); }, [searchParams]);

    const calculateScore = useCallback((text: string, search: string, isStall = false) => {
        if (!text || !search) return 0;
        const t = text.toLowerCase();
        const s = search.toLowerCase();
        if (t === s) return 100;
        if (t.startsWith(s)) return 90;
        if (t.includes(s)) return 60;
        return 0;
    }, []);

    const results = useMemo(() => {
        const s = query.trim();
        if (!s) return [];
        const stallResults: SearchResult[] = stalls.map(stall => ({
            id: String(stall.id), name: stall.name, type: 'stall' as const,
            score: calculateScore(stall.name, s, true), metadata: stall
        })).filter(r => r.score > 0);
        const productResults: SearchResult[] = allItems.map(item => ({
            id: String(item.id), name: item.name, type: 'product' as const,
            score: calculateScore(item.name, s) * 1.2, metadata: item
        })).filter(r => r.score > 0);
        return [...stallResults, ...productResults].sort((a, b) => b.score - a.score).slice(0, 5);
    }, [query, stalls, allItems, calculateScore]);

    const navigateToResult = (result: SearchResult) => {
        if (result.type === 'stall') router.push(`/stall?name=${encodeURIComponent(result.name)}`);
        else router.push(`/stall/item/show?a=${encodeURIComponent(result.metadata.stallName || '')}&id=${result.id}`);
        setIsFocused(false);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) router.push(`/item?q=${encodeURIComponent(query.trim())}`);
        setIsFocused(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;
        if (e.key === 'ArrowDown') setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        else if (e.key === 'ArrowUp') setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
        else if (e.key === 'Enter' && activeIndex > -1) navigateToResult(results[activeIndex]);
        else if (e.key === 'Escape') setIsFocused(false);
    };

    useEffect(() => {
        const out = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsFocused(false); };
        document.addEventListener('mousedown', out);
        return () => document.removeEventListener('mousedown', out);
    }, []);

    if (isNoNavRoute) return null;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 h-14 flex items-center">
            <div className="max-w-4xl mx-auto w-full px-4 flex items-center gap-3">
                {!isHome && (
                    <button onClick={() => router.back()} className="p-1.5 text-neutral-400 hover:text-orange-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                <div className="flex-1 relative" ref={dropdownRef}>
                    <form onSubmit={handleSubmit} className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isFocused ? 'text-orange-500' : 'text-neutral-400'}`} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full bg-neutral-50 border border-neutral-100 rounded-md pl-9 pr-8 py-2 text-sm outline-none focus:border-orange-500/50 focus:bg-white transition-all placeholder:text-neutral-400"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {isFocused && query.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-sm overflow-hidden z-[60]">
                            <div className="py-1">
                                {results.map((res, idx) => (
                                    <button
                                        key={res.id}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        onClick={() => navigateToResult(res)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${activeIndex === idx ? 'bg-orange-500 text-white' : 'text-neutral-700'}`}
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border overflow-hidden relative ${activeIndex === idx ? 'border-white/20 bg-white/10' : 'bg-neutral-50 border-neutral-100'}`}>
                                            {res.metadata.image ? (
                                                <Image src={res.metadata.image} alt={res.name} fill className="object-cover" sizes="32px" />
                                            ) : (
                                                res.type === 'stall' ? <Store className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold uppercase tracking-tight truncate">{res.name}</div>
                                            <div className={`text-[10px] uppercase tracking-wider ${activeIndex === idx ? 'text-orange-100' : 'text-neutral-400'}`}>
                                                {res.type === 'stall' ? 'Vendor' : res.metadata.stallName}
                                            </div>
                                        </div>
                                        {res.type === 'product' && (
                                            <div className="text-xs font-medium pr-1">₱{res.metadata.price}</div>
                                        )}
                                    </button>
                                ))}
                                <button onClick={() => handleSubmit()} className="w-full px-3 py-2 text-[10px] font-bold text-center uppercase tracking-widest text-orange-500 border-t border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    View all results
                                </button>
                            </div>
                        </div>
                    )}
                </div>

<Link 
    href="/account" 
    className="shrink-0 transition-transform duration-75 active:scale-95"
>
    <div className="
        /* Size & Shape */
        w-9 h-9 
        md:w-10 md:h-10 
        rounded-md 
        
        /* Layout */
        flex items-center justify-center 
        overflow-hidden 
        relative
        
        /* Styling */
        bg-neutral-50 
        border border-neutral-100 
        hover:border-orange-500/30 
        hover:bg-white
        transition-all
    ">
        {mounted && profile?.user?.avatar ? (
            <Image 
                src={profile.user.avatar} 
                alt="Profile" 
                fill 
                className="object-cover" 
                sizes="(max-width: 768px) 36px, 40px"
            />
        ) : (
            <div className="flex flex-col items-center justify-center bg-orange-50/50 w-full h-full">
                <span className="
                    text-[10px] 
                    md:text-[11px] 
                    font-bold 
                    text-orange-600 
                    tracking-tighter 
                    uppercase
                ">
                    {mounted && profile?.user?.clientName 
                        ? profile.user.clientName.slice(0, 2) 
                        : '??'
                    }
                </span>
            </div>
        )}
    </div>
</Link>
            </div>
        </header>
    );
}