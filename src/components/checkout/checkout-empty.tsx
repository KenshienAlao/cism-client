import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutEmpty({ receipt }: { receipt: React.ReactNode }) {
    const router = useRouter();
    return (
        <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center p-6 text-center antialiased">
            {receipt}

            <div className="w-16 h-16 bg-secondary border border-border rounded-lg flex items-center justify-center mb-5">
                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-1.5 max-w-sm mb-6">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    No active checkout session
                </h1>
                <p className="text-sm text-muted-foreground">
                    It looks like you haven't selected any items to check out yet, or this session has expired.
                </p>
            </div>

            <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 h-10 bg-orange-500 text-white text-sm font-medium rounded-lg inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/40 active:scale-[0.99]"
            >
                Return to Shop
            </button>
        </div>
    );
}