import { Search, X, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
    onSearch: (query: string) => void;
    items?: any[];
    placeholder?: string;
}

export function SearchBar({ onSearch, items = [], placeholder = "Search stalls, food, drinks…" }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { profile } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const filteredItems = query.trim() === ''
        ? []
        : items.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onSearch(query);
        setIsFocused(false);
    };

    const handleClear = () => {
        setQuery('');
    };

    const handleItemClick = (itemName: string, itemId: string) => {
        setQuery(itemName);
        router.push(`/item/${itemId}`);
        setIsFocused(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initials = profile?.user?.clientName?.slice(0, 2).toUpperCase() ?? null;
    const avatar = profile?.user?.avatar ?? null;

    return (
        <header className="sticky top-0 z-50 header-glass">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center gap-3 h-16">

                    {/* Brand mark */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 shrink-0 select-none group"
                    />

                    {/* Search */}
                    <div className="flex-1 relative" ref={dropdownRef}>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div
                                className={`relative flex items-center rounded-2xl transition-all duration-200 ${isFocused
                                    ? 'bg-neutral-100 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/5'
                                    : 'bg-neutral-100 hover:bg-neutral-200/70'
                                    }`}
                            >
                                <Search
                                    className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-orange-500' : 'text-neutral-400'
                                        }`}
                                    strokeWidth={2.5}
                                />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                    }}
                                    onFocus={() => setIsFocused(true)}
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

                        {/* Autocomplete Dropdown */}
                        {isFocused && query.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2">
                                    <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                        Suggestions
                                    </div>
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item, idx) => (
                                            <button
                                                key={item.id || idx}
                                                onClick={() => handleItemClick(item.name, item.id)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors group text-left"
                                            >
                                                <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                                                    {item.image ? (
                                                        <img src={typeof item.image === 'string' ? item.image : ''} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UtensilsCrossed className="w-4 h-4 text-neutral-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold truncate">{item.name}</div>
                                                    <div className="text-[11px] text-neutral-400 truncate">{item.category || 'General'}</div>
                                                </div>
                                                <div className="text-xs font-bold text-neutral-400 group-hover:text-orange-500">
                                                    ₱{item.price}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-3 py-8 text-center">
                                            <p className="text-sm text-neutral-500">No results found for "{query}"</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleSubmit()}
                                        className="w-full mt-1 px-3 py-2 text-xs font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors text-left flex items-center gap-2"
                                    >
                                        <Search className="w-3 h-3" />
                                        Search all results for "{query}"
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Avatar / Account button */}
                    <Link
                        href="/account"
                        className="group relative shrink-0 focus:outline-none"
                        aria-label="Account"
                    >
                        <div className="relative h-9 w-9 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-orange-500/40 group-focus-visible:ring-orange-500/60 transition-all duration-200 shadow-md">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="avatar"
                                    className="h-full w-full object-cover"
                                />
                            ) : initials ? (
                                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-rose-500">
                                    <span className="text-xs font-black text-white tracking-tight">
                                        {initials}
                                    </span>
                                </div>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-neutral-200 animate-pulse" />
                            )}
                        </div>
                    </Link>

                </div>
            </div>
        </header>
    );
}
