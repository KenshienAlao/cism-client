import { formatDate } from "@/lib/utils/formatDate";
import { Order } from "@/model/order.model";
import { Receipt } from "lucide-react";

export default function Orderinfo({ order }: { order: Order }) {
    return (
        <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-500 mb-4">
                <Receipt className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Order No.</p>
            <h2 className="text-3xl font-black text-neutral-900 tracking-tighter mb-2">{order.orderCode}</h2>
            <p className="text-xs font-medium text-neutral-500">
                {formatDate((order.createdAt))}
            </p>
        </div>

    )
}