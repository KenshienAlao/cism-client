'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { CreditCard, Truck, Store, ShoppingBag, MapPin, Wallet, MessageSquare } from 'lucide-react';
import Loading from '@/components/ui/loading';
import { CheckoutSection } from '@/components/ui/checkout-section';
import { OptionCard } from '@/components/ui/option-card';
import { CheckoutItemList } from '@/components/checkout/item-list';
import { OrderSummary } from '@/components/checkout/order-summary';
import { useCheckout } from '@/hooks/use-order';
import { ReceiptModal } from '@/components/checkout/receipt-modal';

const DELIVERY_FEE_PER_ITEM = 2;

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cartItems, stalledItems, isLoading } = useCart();

    const {
        deliveryMethod, setDeliveryMethod,
        message, setMessage,
        isReceiptOpen, setIsReceiptOpen,
        handlePlaceOrder,
        isPending,
        completedOrders
    } = useCheckout();

    const selectedIds = useMemo(() => {
        const param = searchParams.get('items');
        if (!param) return null;
        return new Set(param.split(',').map(Number).filter(n => !isNaN(n)));
    }, [searchParams]);

    const checkoutItems = useMemo(() => {
        if (!selectedIds) return cartItems;
        return cartItems.filter(item => selectedIds.has(item.id));
    }, [cartItems, selectedIds]);

    const checkoutGroups = useMemo(() => {
        if (!selectedIds) return stalledItems;
        return stalledItems
            .map(group => ({ ...group, items: group.items.filter(item => selectedIds.has(item.id)) }))
            .filter(group => group.items.length > 0);
    }, [stalledItems, selectedIds]);

    const subtotal = useMemo(() => {
        return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [checkoutItems]);

    const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
    const isDeliver = deliveryMethod === 'deliver';
    const deliveryFee = isDeliver ? itemCount * DELIVERY_FEE_PER_ITEM : 0;
    const grandTotal = subtotal + deliveryFee;

    const handleCheckout = () => {
        handlePlaceOrder(checkoutItems);
    };

    if (isLoading) return <Loading />;

    const handleCloseReceipt = () => {
        setIsReceiptOpen(false);
        router.push('/');
    };

    const receipt = (
        <ReceiptModal
            isOpen={isReceiptOpen}
            onClose={handleCloseReceipt}
            orders={completedOrders}
        />
    );

    if (!checkoutItems.length && !isReceiptOpen) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                {receipt}
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-neutral-200" />
                </div>
                <h1 className="text-2xl font-black text-neutral-900 mb-2">No items selected</h1>
                <p className="text-neutral-400 text-sm mb-10 max-w-xs">Go back to your cart and select the items you'd like to check out.</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-10 py-4 bg-neutral-900 text-white font-black rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:bg-neutral-800 transition-all"
                >
                    Back to Market
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {receipt}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left: Options */}
                    <div className="lg:col-span-8 space-y-4">
                        <CheckoutSection icon={MapPin} color="text-orange-500" title="Delivery">
                            <div className="grid grid-cols-2 gap-3">
                                <OptionCard active={isDeliver} onClick={() => setDeliveryMethod('deliver')} icon={Truck} label="Deliver" subtitle="To your location" />
                                <OptionCard active={!isDeliver} onClick={() => setDeliveryMethod('pickup')} icon={Store} label="Pick Up" subtitle="Go to the stall" />
                            </div>
                        </CheckoutSection>

                        <CheckoutSection icon={CreditCard} color="text-blue-500" title="Payment">
                            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-orange-500 bg-orange-50/20">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <Wallet className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-neutral-900 block">
                                        {isDeliver ? 'Cash on Delivery' : 'Cash on Site'}
                                    </span>
                                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">
                                        {isDeliver ? 'Pay when it arrives' : 'Pay at the stall'}
                                    </span>
                                </div>
                                <div className="w-4 h-4 rounded-full border-[3px] border-orange-500" />
                            </div>
                        </CheckoutSection>

                        <CheckoutSection icon={MessageSquare} color="text-violet-500" title="Message" badge="Optional">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Special instructions, requests, or notes for the seller..."
                                maxLength={200}
                                rows={3}
                                className="smart-textarea"
                            />
                            <div className="flex justify-end mt-1.5">
                                <span className={`text-[9px] font-bold tracking-wider ${message.length > 180 ? 'text-orange-500' : 'text-neutral-300'}`}>
                                    {message.length}/200
                                </span>
                            </div>
                        </CheckoutSection>

                        {/* Items (Mobile) */}
                        <section className="lg:hidden rounded-2xl border border-black/5 overflow-hidden">
                            <div className="px-5 py-4 bg-neutral-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="w-4 h-4 text-neutral-400" />
                                    <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">Items</h2>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                            </div>
                            <div className="p-4">
                                <CheckoutItemList groups={checkoutGroups} />
                            </div>
                        </section>
                    </div>

                    {/* Right: Summary */}
                    <div className="lg:col-span-4">
                        <OrderSummary
                            groups={checkoutGroups}
                            itemCount={itemCount}
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            grandTotal={grandTotal}
                            isDeliver={isDeliver}
                            deliveryFeePerItem={DELIVERY_FEE_PER_ITEM}
                            onPlaceOrder={handleCheckout}
                            isPending={isPending}
                        />
                    </div>
                </div>
            </main>

            {receipt}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<Loading />}>
            <CheckoutContent />
        </Suspense>
    );
}
