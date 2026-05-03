import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function ProductHeader() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-orange-500 transition-all active:scale-95"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
