import { X, CreditCard, MapPin, User, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CheckoutItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    stallName: string;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CheckoutItem[];
    onConfirmOrder: (orderDetails: OrderDetails) => void;
}

export interface OrderDetails {
    name: string;
    paymentMethod: 'cod' | 'cos';
    deliveryNote: string;
}

export function CheckoutModal({ isOpen, onClose, items, onConfirmOrder }: CheckoutModalProps) {
    const [step, setStep] = useState<'details' | 'confirmation'>('details');
    const [name, setName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cos'>('cos');
    const [deliveryNote, setDeliveryNote] = useState('');

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleContinue = () => {
        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }
        setStep('confirmation');
    };

    const handleConfirm = () => {
        onConfirmOrder({ name, paymentMethod, deliveryNote });
        setStep('details');
        setName('');
        setPaymentMethod('cos');
        setDeliveryNote('');
    };

    const handleClose = () => {
        setStep('details');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={handleClose}
            />

            <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0">
                    <h2 className="text-lg font-semibold">
                        {step === 'details' ? 'Order Details' : 'Confirm Your Order'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {step === 'details' ? (
                        <>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">Your Name</span>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <CreditCard className="w-5 h-5" />
                                    <span className="font-medium">Payment Method</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 border-orange-500 bg-orange-50">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cos"
                                            checked={paymentMethod === 'cos'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'cos')}
                                            className="w-4 h-4 text-orange-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Cash on Site</p>
                                            <p className="text-xs text-gray-500">Pay when you collect</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 border-gray-200">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                                            className="w-4 h-4 text-orange-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">Cash on Delivery</p>
                                            <p className="text-xs text-gray-500">Pay on delivery to location</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-medium">Delivery Note</span>
                                </div>
                                <textarea
                                    value={deliveryNote}
                                    onChange={(e) => setDeliveryNote(e.target.value)}
                                    placeholder="E.g., Beside Engineering building, 2nd floor bench, near water station"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                />
                                <p className="text-xs text-gray-500">Help us find you on campus</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <h3 className="font-semibold text-gray-700">Order Summary</h3>
                                <div className="space-y-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.name} x{item.quantity}
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
                                        RM{subtotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Name</span>
                                    <span className="font-medium">{name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Payment</span>
                                    <span className="font-medium">
                                        {paymentMethod === 'cos' ? 'Cash on Site' : 'Cash on Delivery'}
                                    </span>
                                </div>
                                {deliveryNote && (
                                    <div className="text-sm">
                                        <span className="text-gray-600 block mb-1">Delivery Note</span>
                                        <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">
                                            {deliveryNote}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">Total</span>
                        <span className="text-xl font-semibold">RM{subtotal.toFixed(2)}</span>
                    </div>
                    {step === 'details' ? (
                        <button
                            onClick={handleContinue}
                            className="w-full bg-orange-500 text-white py-3.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            Continue
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep('details')}
                                className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-orange-500 text-white py-3.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Confirm Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
