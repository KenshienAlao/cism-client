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
        <header className="sticky top-0 z-50 bg-white border-b border-neutral-100 h-16 flex items-center">
            {!isHome && (
                <button
                    onClick={() => router.back()}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-neutral-50 rounded-md text-neutral-400 active:bg-neutral-100 active:text-orange-500 transition-colors z-10 border border-neutral-100"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            )}

            <div className={`max-w-2xl mx-auto w-full px-4 h-full ${!isHome ? 'pl-16' : ''}`}>
                <div className="flex items-center gap-4 h-full">
                    <div className="flex-1 relative" ref={dropdownRef}>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className={`relative flex items-center rounded-md border transition-colors ${isFocused ? 'border-orange-500/30 bg-white' : 'border-neutral-100 bg-neutral-50'
                                }`}>
                                <Search className={`absolute left-3.5 w-4 h-4 ${isFocused ? 'text-orange-500' : 'text-neutral-300'}`} />
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
                                    className="w-full bg-transparent pl-10 pr-10 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-900 outline-none placeholder:text-neutral-300 placeholder:font-medium"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="absolute right-3 text-neutral-300 active:text-neutral-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {isFocused && query.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-neutral-100 rounded-md overflow-hidden z-50">
                                <div className="p-1.5 max-h-[70vh] overflow-y-auto">
                                    {results.map((result, idx) => (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            onClick={() => navigateToResult(result)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-left ${activeIndex === idx ? 'bg-neutral-50' : ''
                                                }`}
                                        >
                                            <div className="h-9 w-9 shrink-0 rounded-md bg-neutral-50 flex items-center justify-center overflow-hidden relative border border-neutral-100">
                                                {result.metadata.image ? (
                                                    <Image src={typeof result.metadata.image === 'string' ? result.metadata.image : ''} alt={result.name} fill className="h-full w-full object-cover" />
                                                ) : (
                                                    result.type === 'stall' ? <Store className="w-4 h-4 text-orange-500" /> : <UtensilsCrossed className="w-4 h-4 text-neutral-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest truncate">{result.name}</div>
                                                <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest truncate flex items-center gap-1 mt-0.5">
                                                    {result.type === 'stall' ? 'Shop' : result.metadata.stallName}
                                                </div>
                                            </div>
                                            {result.type === 'product' && (
                                                <div className="text-[10px] font-bold text-neutral-900 tracking-tight">₱{result.metadata.price}</div>
                                            )}
                                        </button>
                                    ))}

                                    {query.trim() && (
                                        <button
                                            onClick={() => handleSubmit()}
                                            className="w-full mt-1.5 px-3 py-3 text-[9px] font-bold text-orange-500 uppercase tracking-widest bg-neutral-50 rounded-md active:bg-orange-500 active:text-white transition-colors text-center"
                                        >
                                            Search all results for "{query}"
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/account" className="shrink-0">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-neutral-50 border border-neutral-100 active:bg-neutral-100 transition-colors">
                            {!mounted ? (
                                <div className="h-full w-full bg-neutral-50 animate-pulse" />
                            ) : avatar ? (
                                <Image src={avatar} alt="avatar" fill className="object-cover" />
                            ) : initials ? (
                                <div className="h-full w-full flex items-center justify-center bg-orange-500">
                                    <span className="text-xs font-bold text-white tracking-widest">{initials}</span>
                                </div>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-neutral-300">??</span>
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
