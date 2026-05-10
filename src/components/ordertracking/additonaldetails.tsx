import { Order } from "@/model/order.model";
import { Clock, Truck } from "lucide-react";

export default function Additonaldetails({ order }: { order: Order }) {
    return (
        <div className="bg-white rounded-lg p-6 border border-neutral-100 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                <div className="flex items-center gap-3 text-neutral-500">
                    <div className="w-8 h-8 rounded-md bg-neutral-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-neutral-300" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment</span>
                </div>
                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3 text-neutral-500">
                    <div className="w-8 h-8 rounded-md bg-neutral-50 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-neutral-300" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Delivery</span>
                </div>
                <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-widest">{order.deliveryMethod}</span>
            </div>

            {order.cancelReason && order.status === 'CANCELLED' && (
                <div className="mt-4 pt-4 border-t border-neutral-50">
                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-2">Rejection Note</p>
                    <div className="bg-rose-50 p-4 rounded-md text-rose-900 text-xs font-medium leading-relaxed border border-rose-100 italic">
                        "{order.cancelReason}"
                    </div>
                </div>
            )}

            {order.note && (
                <div className="mt-4 pt-4 border-t border-neutral-50">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2">My Note</p>
                    <div className="bg-neutral-50 p-4 rounded-md text-neutral-600 text-xs font-medium leading-relaxed border border-neutral-100">
                        {order.note}
                    </div>
                </div>
            )}
        </div>
    )
}