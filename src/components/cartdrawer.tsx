import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    stallName: string;
    quantity: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }: CartDrawerProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    if (!isOpen) return null;

    const drawerContent = (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">
                        My Cart ({itemCount})
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 p-1"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ShoppingCart className="w-16 h-16 mb-4" />
                        <p>Your cart is empty</p>
                        <p className="text-sm mt-2">Start adding some delicious items!</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium truncate">{item.name}</h3>
                                <p className="text-xs text-gray-500 truncate">{item.stallName}</p>
                                <p className="text-sm font-semibold text-orange-600 mt-1">
                                    RM{item.price.toFixed(2)}
                                </p>

                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200">
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            className="p-1.5 hover:bg-gray-100 rounded-l-md"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                            className="p-1.5 hover:bg-gray-100 rounded-r-md"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="ml-auto text-red-500 hover:text-red-700 p-1.5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {items.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-lg font-semibold">RM{subtotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={onCheckout}
                        className="w-full bg-orange-500 text-white py-3.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            {isMobile ? (
                <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-2xl overflow-hidden shadow-2xl">
                    {drawerContent}
                </div>
            ) : (
                <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md shadow-2xl">
                    {drawerContent}
                </div>
            )}
        </>
    );
}
