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
import { useItem } from '@/hooks/use-item';
import { CartResponse } from '@/model/cart.model';
import { notifError } from '@/lib/toast';

const DELIVERY_FEE_PER_ITEM = 2;

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cartItems, stalledItems, isLoading: isCartLoading } = useCart();
    const { items: allStalls, isLoading: isItemsLoading } = useItem();

    const isLoading = isCartLoading || isItemsLoading;

    const isBuyNow = searchParams.get('buyNow') === 'true';

    const {
        deliveryMethod, setDeliveryMethod,
        message, setMessage,
        isReceiptOpen, setIsReceiptOpen,
        handlePlaceOrder,
        isPending,
        completedOrders
    } = useCheckout();

    const { checkoutItems, checkoutGroups } = useMemo(() => {
        if (isBuyNow) {
            const itemId = Number(searchParams.get('itemId'));
            const variationId = Number(searchParams.get('variationId')) || 0;
            const quantity = Number(searchParams.get('quantity')) || 1;

            for (const stall of allStalls) {
                const catalogItem = stall.items.find(i => Number(i.id) === itemId);
                if (catalogItem) {
                    let enriched: CartResponse = {
                        id: Date.now(),
                        itemId: itemId,
                        variationId: variationId || null,
                        name: catalogItem.name,
                        price: catalogItem.price,
                        image: typeof catalogItem.image === 'string' ? catalogItem.image : '',
                        stallName: stall.name,
                        quantity: quantity
                    };

                    if (variationId) {
                        const variation = catalogItem.variations?.find(v => Number(v.id) === variationId);
                        if (variation) {
                            enriched.price = variation.price;
                            if (typeof variation.image === 'string') enriched.image = variation.image;
                            if (variation.name && variation.name.toLowerCase() !== 'default') {
                                enriched.name = `${catalogItem.name} (${variation.name})`;
                            }
                        }
                    }

                    return {
                        checkoutItems: [enriched],
                        checkoutGroups: [{ stallName: stall.name, items: [enriched], subtotal: enriched.price * quantity }]
                    };
                }
            }
        }

        const param = searchParams.get('items');
        const selectedIds = param ? new Set(param.split(',').map(Number).filter(n => !isNaN(n))) : null;

        if (!selectedIds) {
            return { checkoutItems: cartItems, checkoutGroups: stalledItems };
        }

        return {
            checkoutItems: cartItems.filter(item => selectedIds.has(item.id)),
            checkoutGroups: stalledItems
                .map(group => ({ ...group, items: group.items.filter(item => selectedIds.has(item.id)) }))
                .filter(group => group.items.length > 0)
        };
    }, [isBuyNow, searchParams, allStalls, cartItems, stalledItems]);

    const subtotal = useMemo(() => {
        return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [checkoutItems]);

    const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
    const isDeliver = deliveryMethod === 'deliver';
    const deliveryFee = isDeliver ? itemCount * DELIVERY_FEE_PER_ITEM : 0;
    const grandTotal = subtotal + deliveryFee;

    const handleCheckout = () => {
        if (isDeliver && !message.trim()) {
            notifError("Delivery location is required in Notes.");
            return;
        }

        if (isBuyNow) {
            const itemId = Number(searchParams.get('itemId'));
            const variationId = Number(searchParams.get('variationId')) || 0;
            const quantity = Number(searchParams.get('quantity')) || 1;
            const stallId = Number(searchParams.get('stallId'));

            handlePlaceOrder([], {
                stallId,
                itemId,
                variationId,
                quantity
            });
        } else {
            handlePlaceOrder(checkoutItems);
        }
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                {receipt}
                <div className="w-24 h-24 bg-neutral-50 flex items-center justify-center mb-8 border border-neutral-100">
                    <ShoppingBag className="w-10 h-10 text-neutral-200" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter mb-4 uppercase">Empty Manifest</h1>
                <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mb-12 max-w-xs">
                    Please select items from your cart to proceed with the transaction.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-12 py-5 bg-neutral-900 text-white font-black uppercase text-[11px] tracking-[0.3em] active:bg-neutral-800 transition-colors"
                >
                    Back to Market
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/20 flex flex-col animate-in fade-in duration-700">
            {receipt}

            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-10 py-10 md:py-20 space-y-12 md:space-y-20">
                <header className="px-1 space-y-3">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl md:text-8xl font-black text-neutral-900 tracking-tighter uppercase leading-none">Checkout</h1>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-[0.4em]">Transaction Verification Manifest</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">
                    <div className="lg:col-span-7 space-y-12 md:space-y-16">
                        <CheckoutSection icon={MapPin} color="text-orange-500" title="Delivery">
                            <div className="grid grid-cols-2 gap-4">
                                <OptionCard
                                    active={isDeliver}
                                    onClick={() => setDeliveryMethod('deliver')}
                                    icon={Truck}
                                    label="Deliver"
                                    subtitle="To your location"
                                />
                                <OptionCard
                                    active={!isDeliver}
                                    onClick={() => setDeliveryMethod('pickup')}
                                    icon={Store}
                                    label="Pick Up"
                                    subtitle="Collect at stall"
                                />
                            </div>
                        </CheckoutSection>

                        <CheckoutSection icon={CreditCard} color="text-orange-500" title="Payment">
                            <div className="flex items-center gap-6 p-6 border-2 border-orange-500 bg-white shadow-sm transition-colors">
                                <div className="w-14 h-14 bg-orange-50 flex items-center justify-center border border-orange-100">
                                    <Wallet className="w-7 h-7 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-base md:text-xl font-black text-neutral-900 block tracking-tight uppercase">
                                        {isDeliver ? 'Cash on Delivery' : 'Cash on Site'}
                                    </span>
                                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">
                                        Settlement upon fulfillment
                                    </span>
                                </div>
                            </div>
                        </CheckoutSection>

                        <CheckoutSection
                            icon={MessageSquare}
                            color={isDeliver && !message ? "text-orange-500" : "text-neutral-400"}
                            title="Notes"
                            badge={isDeliver ? "Required" : "Optional"}
                        >
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isDeliver
                                    ? "Describe where you are or what room are you in rn in the campus..."
                                    : "Add specific requirements or delivery notes..."
                                }
                                maxLength={200}
                                rows={5}
                                className={`w-full bg-white border p-6 text-sm md:text-base font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none transition-colors shadow-sm resize-none ${isDeliver && !message ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200 focus:border-orange-500'}`}
                            />
                            <div className="flex justify-end mt-4">
                                <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${message.length > 180 || (isDeliver && !message) ? 'text-orange-500' : 'text-neutral-400'}`}>
                                    {message.length} / 200 Units
                                </span>
                            </div>
                        </CheckoutSection>

                        <section className="lg:hidden space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.3em]">Manifest</h2>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{itemCount} Positions</span>
                            </div>
                            <div className="bg-white border border-neutral-200 p-2 shadow-sm">
                                <CheckoutItemList groups={checkoutGroups} />
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 lg:sticky lg:top-10">
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
