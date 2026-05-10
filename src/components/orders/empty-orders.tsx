'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function EmptyOrders() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 flex items-center justify-center mb-8">
                <ShoppingBag className="w-10 h-10 text-neutral-200" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">No orders yet</h1>
            <p className="text-neutral-400 text-sm mb-12 max-w-xs leading-relaxed">
                You haven't placed any orders yet. Start exploring our stalls to find something delicious!
            </p>
            <Link
                href="/"
                className="px-12 py-5 bg-orange-500 text-white font-black rounded-[2rem] uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
            >
                Start Shopping
            </Link>
        </div>
    );
}
