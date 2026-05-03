import { X, CheckCircle, Copy, Clock, CreditCard, User, MapPin } from 'lucide-react';
import { useState } from 'react';

interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
}

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    items: ReceiptItem[];
    total: number;
    customerName: string;
    paymentMethod: string;
    deliveryNote?: string;
    timestamp: string;
    onViewOrder: () => void;
}

export function ReceiptModal({
    isOpen,
    onClose,
    orderId,
    items,
    total,
    customerName,
    paymentMethod,
    deliveryNote,
    timestamp,
    onViewOrder,
}: ReceiptModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-md md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-3" strokeWidth={2} />
                        <h2 className="text-2xl font-bold mb-1">Order Placed!</h2>
                        <p className="text-orange-100 text-sm">Your order has been confirmed</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl font-bold tracking-wider">{orderId}</span>
                                    <button
                                        onClick={handleCopyOrderId}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-600 mt-1">Copied!</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-700">Order Details</h3>
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
                            <div className="pt-2 border-t border-gray-300 flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold text-orange-600 text-lg">
                                    RM{total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs">Customer</p>
                                    <p className="font-medium">{customerName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs">Payment</p>
                                    <p className="font-medium">{paymentMethod}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-gray-500 text-xs">Time</p>
                                    <p className="font-medium">{timestamp}</p>
                                </div>
                            </div>

                            {deliveryNote && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-gray-500 text-xs">Delivery Note</p>
                                        <p className="font-medium text-gray-800">{deliveryNote}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-white space-y-2">
                    <button
                        onClick={onViewOrder}
                        className="w-full bg-orange-500 text-white py-3.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Track Order
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </>
    );
}
