import { STATUS, STATUS_ORDER } from "@/config/track.config";
import { Order } from "@/model/order.model";
import { Clock } from "lucide-react";

interface TimelineProps {
    order: Order,
    currentStatusIndex: number
}

export default function Timeline({ order, currentStatusIndex }: TimelineProps) {
    return (
        <div className="bg-white p-6 border border-neutral-100 rounded-lg">
            <div className="relative">
                {order.status === 'CANCELLED' ? (
                    <div className="flex flex-col items-center text-center py-6">
                        <div className="w-14 h-14 rounded-md bg-rose-50 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-rose-500" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Order Cancelled</h3>
                        <p className="text-[11px] font-medium text-neutral-400 mt-2 max-w-[240px] leading-relaxed">
                            This order was rejected by the stall. See the reason below in the details section.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="absolute left-5 top-5 bottom-5 w-px bg-neutral-100" />

                        <div className="space-y-8">
                            {STATUS_ORDER.map((statusKey, index) => {
                                const config = { ...STATUS[statusKey] };

                                if (statusKey === 'READY') {
                                    if (order.deliveryMethod === 'PICKUP') {
                                        config.label = 'Ready for Pickup';
                                        config.description = `Collect your order from ${order.stallName}.`;
                                    } else {
                                        config.label = 'Out for Delivery';
                                        config.description = 'Please stay at your pinned location.';
                                    }
                                }

                                const Icon = config.icon;
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;

                                return (
                                    <div key={statusKey} className="relative flex items-start gap-5">
                                        <div
                                            className={`relative z-10 w-10 h-10 rounded-md flex items-center justify-center transition-colors ${isActive ? config.bgColor : 'bg-neutral-50'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-300'}`} strokeWidth={isCurrent ? 3 : 2} />
                                        </div>

                                        <div className="flex-1 pt-1.5 min-w-0">
                                            <h3
                                                className={`text-xs font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-300'
                                                    }`}
                                            >
                                                {config.label}
                                            </h3>
                                            <p
                                                className={`text-[11px] font-medium mt-0.5 leading-relaxed transition-colors ${isActive ? 'text-neutral-400' : 'text-neutral-200'
                                                    }`}
                                            >
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}