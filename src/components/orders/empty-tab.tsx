import { ShoppingBag } from "lucide-react";

export default function Emptytab({ activeTab }: { activeTab: string }) {
    return (
        <div className="py-40 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-neutral-50 rounded-[2.5rem] flex items-center justify-center mb-8 border border-neutral-100">
                <ShoppingBag className="w-10 h-10 text-neutral-200" />
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">No {activeTab.toLowerCase()} orders</h1>
            <p className="text-neutral-400 text-sm mt-2 max-w-[200px]">Looks like this tab is empty for now.</p>
        </div>
    )
}