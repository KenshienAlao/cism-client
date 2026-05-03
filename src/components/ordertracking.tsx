import { Clock, Package, Truck, CheckCircle, Star, ChevronLeft } from 'lucide-react';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface OrderTrackingProps {
    orderId: string;
    status: OrderStatus;
    items: OrderItem[];
    total: number;
    customerName: string;
    paymentMethod: string;
    deliveryNote?: string;
    timestamp: string;
    onBack: () => void;
    onReview?: () => void;
}

const STATUS_CONFIG = {
    pending: {
        label: 'Order Pending',
        description: 'Waiting for vendor confirmation',
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
    },
    preparing: {
        label: 'Preparing',
        description: 'Your order is being prepared',
        icon: Package,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
    },
    ready: {
        label: 'Ready for Pickup',
        description: 'Your order is ready!',
        icon: Truck,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
    },
    completed: {
        label: 'Completed',
        description: 'Order delivered successfully',
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500',
    },
};

const STATUS_ORDER: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

export function OrderTracking({
    orderId,
    status,
    items,
    total,
    customerName,
    paymentMethod,
    deliveryNote,
    timestamp,
    onBack,
    onReview,
}: OrderTrackingProps) {
    const currentStatusIndex = STATUS_ORDER.indexOf(status);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <h1 className="text-2xl font-bold tracking-wider">{orderId}</h1>
                        <p className="text-xs text-gray-400 mt-1">{timestamp}</p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                        {STATUS_ORDER.map((statusKey, index) => {
                            const config = STATUS_CONFIG[statusKey];
                            const Icon = config.icon;
                            const isActive = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            return (
                                <div key={statusKey} className="relative flex items-start gap-4 pb-8 last:pb-0">
                                    <div
                                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive ? config.bgColor : 'bg-gray-200'
                                            }`}
                                    >
                                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <h3
                                            className={`font-semibold mb-0.5 ${isActive ? 'text-gray-900' : 'text-gray-400'
                                                }`}
                                        >
                                            {config.label}
                                        </h3>
                                        <p
                                            className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'
                                                }`}
                                        >
                                            {config.description}
                                        </p>
                                        {isCurrent && (
                                            <div className="mt-2 inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
                                                Current Status
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-800 text-lg">Order Summary</h2>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {item.name} <span className="text-gray-400">x{item.quantity}</span>
                                </span>
                                <span className="font-medium">
                                    RM{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold text-orange-600 text-lg">
                            RM{total.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Customer</span>
                        <span className="font-medium">{customerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment</span>
                        <span className="font-medium">{paymentMethod}</span>
                    </div>
                    {deliveryNote && (
                        <div>
                            <span className="text-gray-600 block mb-1">Delivery Note</span>
                            <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded">
                                {deliveryNote}
                            </p>
                        </div>
                    )}
                </div>

                {status === 'completed' && onReview && (
                    <button
                        onClick={onReview}
                        className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Star className="w-5 h-5" />
                        Leave a Review
                    </button>
                )}
            </div>
        </div>
    );
}
