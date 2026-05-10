import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white border border-neutral-200 p-8 md:p-16 max-w-lg w-full text-center">
                <div className="w-24 rounded-full h-24 md:w-32 md:h-32 bg-orange-50 flex items-center justify-center mx-auto mb-8">
                    <Compass className="w-12 h-12 md:w-16 md:h-16 text-orange-500" />
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 mb-4 tracking-tight">404</h1>
                <h2 className="text-xl md:text-2xl font-bold text-neutral-700 mb-4">Lost in the Market</h2>
                <p className="text-base md:text-lg text-neutral-500 mb-10 leading-relaxed">
                    We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed.
                </p>
                
                <Link href="/">
                    <button className="w-full md:w-auto px-10 py-4 bg-orange-500 text-white font-bold text-sm md:text-base tracking-wide">
                        Return to Home
                    </button>
                </Link>
            </div>
        </div>
    );
}