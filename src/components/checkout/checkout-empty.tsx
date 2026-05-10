import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutEmpty({receipt}: {receipt: React.ReactNode}) {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                {receipt}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-8">
                    <ShoppingBag className="w-8 h-8 md:w-12 md:h-12 text-neutral-300" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter mb-3 uppercase">
                    Empty Manifest
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mb-10 max-w-xs">
                    Select items from your cart to proceed with the transaction.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-10 md:px-14 py-4 md:py-5 bg-neutral-900 text-white font-black uppercase text-[10px] md:text-xs tracking-[0.3em]"
                >
                    Back to Market
                </button>
            </div>
    )
}