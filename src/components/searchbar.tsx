"use client";

import { Search, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search stalls, food, drinks…" }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { profile } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    const initials = profile?.user?.username?.slice(0, 2).toUpperCase() ?? null;
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
                    <form onSubmit={handleSubmit} className="flex-1">
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
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
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
                        {/* Online dot */}
                        {profile && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                        )}
                    </Link>

                </div>
            </div>
        </header>
    );
}
