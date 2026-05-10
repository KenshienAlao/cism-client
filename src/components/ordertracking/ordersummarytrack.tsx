import { Order } from "@/model/order.model"

interface OrderSummaryTrackProps {
    order: Order,
}

export default function OrderSummaryTrack({ order }: OrderSummaryTrackProps) {
    return (
        <div className="bg-white p-6 border border-neutral-100 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Order Summary</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded">{order.stallName}</span>
            </div>

            <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-md bg-neutral-50 flex-shrink-0 overflow-hidden border border-neutral-100">
                            <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{item.itemName}</p>
                            <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                                {item.variationName ? `${item.variationName} • ` : ''}Qty: {item.quantity}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 shrink-0">
                            ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-dashed border-neutral-100 space-y-3">
                <div className="flex justify-between text-[11px] font-medium uppercase tracking-widest">
                    <span className="text-neutral-400">Subtotal</span>
                    <span className="text-neutral-900">₱{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium uppercase tracking-widest">
                    <span className="text-neutral-400">Delivery Fee</span>
                    <span className="text-neutral-900">₱{order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 items-end border-t border-neutral-50">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-bold text-orange-500 tracking-tight">
                        ₱{order.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    )
}