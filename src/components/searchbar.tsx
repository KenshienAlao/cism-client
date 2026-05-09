'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, X, ShoppingBag, UtensilsCrossed, Store, ArrowLeft, History } from 'lucide-react';
import { useItem } from '@/hooks/use-item';
import { useEnrichedItems } from '@/hooks/use-enriched-items';
import { useAuth } from '@/hooks/use-auth';
import { NO_NAV_ROUTES, PUBLIC_ROUTES } from '@/config/app.config';
import { isPathInRoutes } from '@/lib/utils/route';
import Image from 'next/image';

// --- Types ---
interface SearchResult {
    id: string;
    name: string;
    type: 'product' | 'stall';
    score: number;
    metadata: any;
}

interface SearchBarProps {
    placeholder?: string;
    liveSearch?: boolean;
}

const RECENT_SEARCHES_KEY = 'cism_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({ placeholder = "Search for food, shops, or school supplies...", liveSearch = false }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- State ---
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // --- Hooks ---
    const isNoNavRoute = useMemo(() => isPathInRoutes(pathname, NO_NAV_ROUTES as unknown as string[]), [pathname]);
    const isHome = pathname === '/';
    const { profile } = useAuth();
    const { items: stalls = [] } = useItem();
    const allItems = useEnrichedItems(stalls);

    // --- Effects ---
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) setRecentSearches(JSON.parse(stored));
    }, []);

    // --- Logic ---
    const addToRecentSearches = useCallback((term: string) => {
        if (!term.trim()) return;
        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== term);
            const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const calculateScore = useCallback((text: string, search: string, isStall = false) => {
        if (!text || !search) return 0;
        const t = text.toLowerCase();
        const s = search.toLowerCase();
        if (t === s) return 100;
        if (t.startsWith(s)) return 90;
        const words = t.split(/\s+/);
        if (words.some(word => word.startsWith(s))) return 80;
        if (isStall) {
            const acronym = words.map(w => w[0]).join('');
            if (acronym.startsWith(s)) return 85;
        }
        if (t.includes(s)) return 60;
        return 0;
    }, []);

    const results = useMemo(() => {
        const s = query.trim();
        if (!s) return [];

        const stallResults: SearchResult[] = stalls
            .map(stall => ({
                id: String(stall.id),
                name: stall.name,
                type: 'stall' as const,
                score: calculateScore(stall.name, s, true),
                metadata: stall
            }))
            .filter(r => r.score > 0);

        const productResults: SearchResult[] = allItems
            .map(item => ({
                id: String(item.id),
                name: item.name,
                type: 'product' as const,
                score: calculateScore(item.name, s) * 1.2,
                metadata: item
            }))
            .filter(r => r.score > 0);

        return [...stallResults, ...productResults]
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);
    }, [query, stalls, allItems, calculateScore]);

    // --- Handlers ---
    const navigateToResult = useCallback((result: SearchResult) => {
        addToRecentSearches(result.name);
        if (result.type === 'stall') {
            router.push(`/stall?name=${encodeURIComponent(result.name)}`);
        } else {
            const item = result.metadata;
            const stallAccount = encodeURIComponent(item.stallName || '');
            router.push(`/stall/item/show?a=${stallAccount}&id=${item.id}&q=${encodeURIComponent(item.name)}`);
        }
        setIsFocused(false);
    }, [router, addToRecentSearches]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            addToRecentSearches(trimmed);
            router.push(`/item?q=${encodeURIComponent(trimmed)}`);
        } else {
            router.push('/');
        }
        setIsFocused(false);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && activeIndex > -1) {
            e.preventDefault();
            navigateToResult(results[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsFocused(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isNoNavRoute) return null;

    const initials = profile?.user?.clientName?.slice(0, 2).toUpperCase() ?? null;
    const avatar = profile?.user?.avatar ?? null;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-black/5 h-16 md:h-24 flex items-center">
            {!isHome && (
                <button
                    onClick={() => router.back()}
                    className="absolute left-3 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-neutral-50 rounded-xl md:rounded-2xl text-neutral-400 hover:bg-neutral-100 hover:text-orange-500 transition-all active:scale-90 shrink-0 z-10 shadow-sm border border-black/5"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}

            <div className={`max-w-7xl mx-auto w-full px-4 md:px-6 h-full transition-all duration-300 ${!isHome ? 'pl-14 sm:pl-16 md:pl-24' : ''}`}>
                <div className="flex items-center gap-3 md:gap-6 h-full">
                    <div className="flex-1 relative" ref={dropdownRef}>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className={`relative flex items-center rounded-xl border transition-colors ${isFocused ? 'border-orange-500 bg-white' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
                                }`}>
                                <Search className={`absolute left-3.5 w-4 h-4 transition-colors ${isFocused ? 'text-orange-500' : 'text-neutral-400'}`} strokeWidth={2.5} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setActiveIndex(-1);
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    className="w-full bg-transparent pl-10 pr-10 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none font-medium"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {isFocused && query.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                <div className="p-2 max-h-[70vh] overflow-y-auto">
                                    {results.map((result, idx) => (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            onClick={() => navigateToResult(result)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 rounded-xl transition-colors text-left ${activeIndex === idx ? 'bg-orange-50 text-orange-600' : 'hover:bg-neutral-50'
                                                }`}
                                        >
                                            <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden relative">
                                                {result.metadata.image ? (
                                                    <Image src={typeof result.metadata.image === 'string' ? result.metadata.image : ''} alt={result.name} fill className="h-full w-full object-cover" />
                                                ) : (
                                                    result.type === 'stall' ? <Store className="w-4 h-4 text-orange-500" /> : <UtensilsCrossed className="w-4 h-4 text-neutral-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{result.name}</div>
                                                <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
                                                    {result.type === 'stall' ? <Store className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                                                    {result.type === 'stall' ? 'Shop' : result.metadata.stallName}
                                                </div>
                                            </div>
                                            {result.type === 'product' && (
                                                <div className="text-xs font-bold text-neutral-400">₱{result.metadata.price}</div>
                                            )}
                                        </button>
                                    ))}

                                    {query.trim() && (
                                        <button
                                            onClick={() => handleSubmit()}
                                            className="w-full mt-1 px-3 py-2 text-xs font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors text-left flex items-center gap-2"
                                        >
                                            <Search className="w-3 h-3" /> Search all results for "{query}"
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/account" className="group relative shrink-0">
                        <div className="relative size-14 md:size-20 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden ring-4 ring-white group-hover:ring-orange-500/20 transition-all duration-300">
                            {!mounted ? (
                                <div className="h-full w-full bg-neutral-200 animate-pulse" />
                            ) : avatar ? (
                                <Image src={avatar} alt="avatar" fill className="object-cover" />
                            ) : initials ? (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-rose-500">
                                    <span className="text-sm md:text-xl font-black text-white tracking-tight">{initials}</span>
                                </div>
                            ) : (
                                <div className="h-full w-full bg-neutral-200 animate-pulse" />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
