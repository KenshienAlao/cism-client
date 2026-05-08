import { ChevronLeft, Package } from 'lucide-react';
import { OrderStatus } from './ordertracking';

interface Order {
    id: string;
    orderId: string;
    status: OrderStatus;
    total: number;
    itemCount: number;
    timestamp: string;
}

interface MyOrdersProps {
    orders: Order[];
    onBack: () => void;
    onViewOrder: (orderId: string) => void;
}

const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    PREPARING: { label: 'Preparing', color: 'bg-blue-100 text-blue-700' },
    READY: { label: 'Ready', color: 'bg-purple-100 text-purple-700' },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export function MyOrders({ orders, onBack, onViewOrder }: MyOrdersProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Shopping
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-gray-600 mb-2">
                            No orders yet
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Start shopping and your orders will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => onViewOrder(order.id)}
                                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-gray-100"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                        <p className="font-bold text-lg tracking-wide">{order.orderId}</p>
                                    </div>
                                    <span
                                        className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_CONFIG[order.status].color
                                            }`}
                                    >
                                        {STATUS_CONFIG[order.status].label}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                                    </span>
                                    <span className="font-semibold text-orange-600">
                                        RM{order.total.toFixed(2)}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 mt-2">{order.timestamp}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
