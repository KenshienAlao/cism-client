'use client';

import { useOrder } from '@/hooks/use-order';
import { ShoppingBag, MapPin, Store, Trash2 } from 'lucide-react';
import Loading from '@/components/ui/loading';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';

const TABS = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
type TabType = typeof TABS[number];

export default function OrdersPage() {
    const { useMyOrders, cancelOrder, deleteOrder, handleCancelOrder, handleDeleteOrder, getFilteredOrders } = useOrder();
    const { data: orders, isLoading } = useMyOrders();
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');

    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        return getFilteredOrders(orders, activeTab);
    }, [orders, activeTab, getFilteredOrders]);

    if (isLoading) return <Loading />;

    if (!orders || orders.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">No orders yet</h1>
                <p className="text-neutral-400 text-sm mb-10 max-w-xs">You haven't placed any orders yet. Start exploring the market!</p>
                <Link
                    href="/"
                    className="px-10 py-4 bg-neutral-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] transition-all"
                >
                    Go Shopping
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'PREPARING': return 'text-blue-500 bg-blue-50 border-blue-100';
            case 'READY': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'COMPLETED': return 'text-neutral-500 bg-neutral-50 border-neutral-100';
            case 'CANCELLED': return 'text-rose-500 bg-rose-50 border-rose-100';
            default: return 'text-neutral-400 bg-neutral-50 border-neutral-100';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            {/* Shopee Style Tabs - Sticky & Responsive */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-100 overflow-x-auto scrollbar-hide">
                <div className="max-w-3xl mx-auto flex items-center min-w-max md:justify-center px-2 sm:px-4">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab;
                        const count = orders?.filter(o => o.status.toUpperCase() === tab).length || 0;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-4 sm:px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${isActive ? 'text-orange-500' : 'text-neutral-400'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {tab.replace('_', ' ')}
                                    {count > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] transition-colors ${isActive ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                                            {count}
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-4 sm:space-y-6">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-neutral-100 overflow-hidden shadow-sm transition-all duration-300">
                            {/* Header - Stack on small mobile */}
                            <div className="px-4 sm:px-6 py-4 border-b border-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center justify-between sm:justify-start gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-neutral-50 flex items-center justify-center">
                                            <Store className="w-4 h-4 text-neutral-400" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Stall</span>
                                            <span className="text-xs font-bold text-neutral-900 line-clamp-1">{order.stallName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Date</span>
                                            <span className="text-xs font-bold text-neutral-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`self-start sm:self-center px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="p-4 sm:p-6 space-y-4">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 shrink-0 border border-neutral-100">
                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.itemName}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-neutral-900 truncate">{item.itemName}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-neutral-400">×{item.quantity}</span>
                                                {item.variationName && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-50 text-neutral-500 rounded-md font-bold uppercase tracking-tighter">
                                                        {item.variationName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-neutral-900 shrink-0">₱{(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer - Stack on mobile */}
                            <div className="px-4 sm:px-6 py-5 bg-neutral-50/20 border-t border-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center justify-between sm:justify-start gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                                            <span className="text-[10px] font-black text-orange-500 font-mono">#</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter block">Order ID</span>
                                            <span className="text-xs font-black text-neutral-900 font-mono tracking-wider">{order.receipt}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                                            {order.deliveryMethod === 'DELIVERY' ? <MapPin className="w-3.5 h-3.5 text-neutral-400" /> : <Store className="w-3.5 h-3.5 text-neutral-400" />}
                                        </div>
                                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{order.deliveryMethod}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Total</span>
                                        <span className="text-xl font-black text-neutral-900 tracking-tighter italic">₱{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {order.status.toUpperCase() === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancelOrder.isPending}
                                                className="px-5 py-3 bg-neutral-100 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50"
                                            >
                                                {cancelOrder.isPending && cancelOrder.variables === order.id ? '...' : 'Cancel'}
                                            </button>
                                        )}
                                        {order.status.toUpperCase() === 'CANCELLED' && (
                                            <button
                                                onClick={() => handleDeleteOrder(order.id)}
                                                disabled={deleteOrder.isPending}
                                                className="px-5 py-3 bg-neutral-100 text-neutral-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                {deleteOrder.isPending && deleteOrder.variables === order.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
                                        <Link
                                            href={`/orders/${order.id}/track`}
                                            className="px-8 py-3 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95"
                                        >
                                            Track
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-8 h-8 text-neutral-200" />
                        </div>
                        <h3 className="text-lg font-black text-neutral-900">No {activeTab.toLowerCase()} orders</h3>
                    </div>
                )}
            </main>
        </div>
    );
}
