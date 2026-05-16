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
import { useSidebar } from '@/context/sidebar.context';


interface SearchResult {
    id: string;
    name: string;
    type: 'product' | 'stall';
    score: number;
    metadata: any;
}

export function SearchBar({ placeholder = "Search items or vendors..." }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [mounted, setMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isNoNavRoute = useMemo(() => isPathInRoutes(pathname, NO_NAV_ROUTES as unknown as string[]), [pathname]);
    const isHome = pathname === '/';
    const { profile } = useAuth();
    const { items: stalls = [] } = useItem();
    const allItems = useEnrichedItems(stalls);
    const { isCollapsed } = useSidebar();

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { setQuery(searchParams.get('q') || ''); }, [searchParams]);
    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);


    const calculateScore = useCallback((text: string, search: string) => {
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
            score: calculateScore(stall.name, s), metadata: stall
        })).filter(r => r.score > 0);
        const productResults: SearchResult[] = allItems.map(item => ({
            id: String(item.id), name: item.name, type: 'product' as const,
            score: calculateScore(item.name, s) * 1.1, metadata: item
        })).filter(r => r.score > 0);
        return [...stallResults, ...productResults].sort((a, b) => b.score - a.score).slice(0, 6);
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
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex > -1) navigateToResult(results[activeIndex]);
            else handleSubmit();
        } else if (e.key === 'Escape') {
            setIsFocused(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsFocused(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isNoNavRoute) return null;

    return (
        <header
            className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center transition-[padding] duration-300 ease-in-out"
            style={{ paddingLeft: (mounted && isDesktop && !isNoNavRoute) ? (isCollapsed ? 72 : 256) : undefined }}
        >
            <div className="flex-1 w-full px-4 flex items-center gap-4">
                {!isHome && (
                    <button 
                        onClick={() => router.back()} 
                        className="p-2 -ml-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                <div className="flex-1 relative" ref={dropdownRef}>
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full h-9 bg-input border border-border rounded-md pl-10 pr-8 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
                        />
                        {query && (
                            <button 
                                type="button" 
                                onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {/* Results Dropdown */}
                    {isFocused && query.trim() !== '' && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-sm overflow-hidden z-60">
                            <div className="py-1">
                                {results.length > 0 ? (
                                    results.map((res, idx) => (
                                        <button
                                            key={`${res.type}-${res.id}`}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            onClick={() => navigateToResult(res)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                                                activeIndex === idx ? 'bg-primary text-primary-foreground' : 'text-foreground'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border overflow-hidden relative ${
                                                activeIndex === idx ? 'border-white/20 bg-white/10' : 'bg-secondary border-border'
                                            }`}>
                                                {res.metadata.image ? (
                                                    <Image src={res.metadata.image} alt="" fill className="object-cover" sizes="32px" />
                                                ) : (
                                                    res.type === 'stall' ? <Store className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">{res.name}</div>
                                                <div className={`text-[10px] uppercase tracking-wider font-semibold ${
                                                    activeIndex === idx ? 'text-primary-foreground/80' : 'text-secondary-foreground'
                                                }`}>
                                                    {res.type === 'stall' ? 'Vendor' : res.metadata.stallName}
                                                </div>
                                            </div>
                                            {res.type === 'product' && res.metadata.price && (
                                                <div className="text-xs font-mono font-bold">₱{res.metadata.price}</div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                                        No matches for "{query}"
                                    </div>
                                )}
                                
                                {results.length > 0 && (
                                    <button 
                                        onClick={() => handleSubmit()} 
                                        className="w-full px-3 py-2 text-[10px] font-bold text-center uppercase tracking-widest text-primary border-t border-border hover:bg-accent transition-colors"
                                    >
                                        See all results
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Link href="/account" className="shrink-0 group">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden relative bg-secondary border border-border group-hover:border-primary/50 transition-all">
                        {mounted && profile?.user?.avatar ? (
                            <Image 
                                src={profile.user.avatar} 
                                alt="Profile" 
                                fill 
                                className="object-cover" 
                                sizes="36px"
                            />
                        ) : (
                            <span className="text-xs font-bold text-primary uppercase">
                                {mounted && profile?.user?.clientName ? profile.user.clientName.slice(0, 2) : '??'}
                            </span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}