import { Clock, Truck, ArrowLeft, Star, Receipt, ChevronRight } from 'lucide-react';
import { Order } from '@/model/order.model';
import { formatDate } from '@/lib/utils/formatDate';
import { STATUS, STATUS_ORDER } from '@/config/track.config';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface OrderTrackingProps {
    order: Order;
    onBack: () => void;
    onReview?: () => void;
}

export function OrderTracking({
    order,
    onBack,
    onReview,
}: OrderTrackingProps) {
    const currentStatusIndex = STATUS_ORDER.indexOf(order.status as OrderStatus);

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-300">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 text-orange-500 mb-4">
                        <Receipt className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Receipt No.</p>
                    <h2 className="text-3xl font-black text-neutral-900 tracking-tighter mb-2">{order.receipt}</h2>
                    <p className="text-xs font-medium text-neutral-500">
                        {formatDate(new Date(order.createdAt))}
                    </p>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 relative overflow-hidden">
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-neutral-100 rounded-full" />

                        <div className="space-y-8">
                            {STATUS_ORDER.map((statusKey, index) => {
                                const config = STATUS[statusKey];
                                const Icon = config.icon;
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;

                                return (
                                    <div key={statusKey} className="relative flex items-start gap-6 group">
                                        <div
                                            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? config.bgColor : 'bg-neutral-50'
                                                } ${isCurrent ? 'scale-110 shadow-lg shadow-orange-500/20' : ''}`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-300'}`} strokeWidth={isCurrent ? 3 : 2.5} />
                                        </div>

                                        <div className="flex-1 pt-2">
                                            <h3
                                                className={`text-sm font-black transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-400'
                                                    }`}
                                            >
                                                {config.label}
                                            </h3>
                                            <p
                                                className={`text-xs font-medium mt-1 leading-relaxed transition-colors ${isActive ? 'text-neutral-500' : 'text-neutral-300'
                                                    }`}
                                            >
                                                {config.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-neutral-900">Order Items</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-md">{order.stallName}</span>
                    </div>

                    <div className="space-y-4">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex-shrink-0 overflow-hidden border border-neutral-100">
                                    <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-neutral-900 truncate">{item.itemName}</p>
                                    <p className="text-xs font-medium text-neutral-400 mt-0.5">
                                        {item.variationName ? `${item.variationName} • ` : ''}Qty: {item.quantity}
                                    </p>
                                </div>
                                <span className="text-sm font-black text-neutral-900 shrink-0">
                                    ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-dashed border-neutral-200 space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="text-neutral-900">₱{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-neutral-500">Delivery Fee</span>
                            <span className="text-neutral-900">₱{order.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-3 items-end">
                            <span className="text-sm font-black text-neutral-900">Total</span>
                            <span className="text-xl font-black text-orange-500">
                                ₱{order.totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-neutral-100 space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-50">
                        <div className="flex items-center gap-3 text-neutral-500">
                            <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                        </div>
                        <span className="text-xs font-black text-neutral-900 uppercase">{order.paymentMethod}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3 text-neutral-500">
                            <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Delivery</span>
                        </div>
                        <span className="text-xs font-black text-neutral-900 uppercase">{order.deliveryMethod}</span>
                    </div>

                    {order.note && (
                        <div className="mt-4 pt-4 border-t border-neutral-50">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Note</p>
                            <div className="bg-orange-50/50 p-4 rounded-2xl text-orange-900 text-xs font-medium leading-relaxed border border-orange-100/50">
                                {order.note}
                            </div>
                        </div>
                    )}
                </div>
                {order.status === 'COMPLETED' && onReview && (
                    <button
                        onClick={onReview}
                        className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/20 mt-8"
                    >
                        <Star className="w-4 h-4" strokeWidth={2.5} />
                        Leave a Review
                    </button>
                )}
            </main>
        </div>
    );
}
