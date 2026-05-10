'use client';

import { Suspense, useMemo } from 'react';
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
import { CheckoutEmpty } from '@/components/checkout/checkout-empty';

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
                        itemId,
                        variationId: variationId || null,
                        name: catalogItem.name,
                        price: catalogItem.price,
                        image: typeof catalogItem.image === 'string' ? catalogItem.image : '',
                        stallName: stall.name,
                        quantity,
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
                        checkoutGroups: [{ stallName: stall.name, items: [enriched], subtotal: enriched.price * quantity }],
                    };
                }
            }
        }

        const param = searchParams.get('items');
        const selectedIds = param ? new Set(param.split(',').map(Number).filter(n => !isNaN(n))) : null;

        if (!selectedIds) return { checkoutItems: cartItems, checkoutGroups: stalledItems };

        return {
            checkoutItems: cartItems.filter(item => selectedIds.has(item.id)),
            checkoutGroups: stalledItems
                .map(group => ({ ...group, items: group.items.filter(item => selectedIds.has(item.id)) }))
                .filter(group => group.items.length > 0),
        };
    }, [isBuyNow, searchParams, allStalls, cartItems, stalledItems]);

    const subtotal = useMemo(
        () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [checkoutItems]
    );

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
            handlePlaceOrder([], {
                stallId: Number(searchParams.get('stallId')),
                itemId: Number(searchParams.get('itemId')),
                variationId: Number(searchParams.get('variationId')) || 0,
                quantity: Number(searchParams.get('quantity')) || 1,
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

    if (!checkoutItems.length && !isReceiptOpen && completedOrders.length === 0) return <CheckoutEmpty receipt={receipt}/>

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {receipt}

            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-8 md:py-14 space-y-10 md:space-y-16">

                {/* Page header */}
                <header className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tighter uppercase leading-none">
                        Checkout
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">

                    {/* Left column */}
                    <div className="lg:col-span-7 space-y-8 md:space-y-10">

                        {/* Delivery method */}
                        <CheckoutSection icon={MapPin} color="text-orange-500" title="Delivery">
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
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

                        {/* Payment */}
                        <CheckoutSection icon={CreditCard} color="text-orange-500" title="Payment">
                            <div className="flex items-center gap-5 p-5 md:p-6 border-2 border-orange-500 bg-white">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                                    <Wallet className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
                                </div>
                                <div>
                                    <span className="text-sm md:text-lg font-black text-neutral-900 block uppercase tracking-tight">
                                        {isDeliver ? 'Cash on Delivery' : 'Cash on Site'}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">
                                        Settlement upon fulfillment
                                    </span>
                                </div>
                            </div>
                        </CheckoutSection>

                        {/* Notes */}
                        <CheckoutSection
                            icon={MessageSquare}
                            color={isDeliver && !message ? 'text-orange-500' : 'text-neutral-400'}
                            title="Notes"
                            badge={isDeliver ? 'Required' : 'Optional'}
                        >
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    isDeliver
                                        ? 'Describe your location or room on campus…'
                                        : 'Add specific requirements or special notes…'
                                }
                                maxLength={200}
                                rows={4}
                                className={`w-full bg-white border p-4 md:p-5 text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none resize-none ${
                                    isDeliver && !message
                                        ? 'border-orange-500'
                                        : 'border-neutral-200 focus:border-orange-500'
                                }`}
                            />
                            <div className="flex justify-end mt-2">
                                <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${
                                    message.length > 180 || (isDeliver && !message) ? 'text-orange-500' : 'text-neutral-400'
                                }`}>
                                    {message.length} / 200
                                </span>
                            </div>
                        </CheckoutSection>

                        {/* Mobile item manifest */}
                        <section className="lg:hidden space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.3em]">Manifest</h2>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                            </div>
                            <div className="bg-white border border-neutral-200 p-4">
                                <CheckoutItemList groups={checkoutGroups} />
                            </div>
                        </section>
                    </div>

                    {/* Right column — order summary */}
                    <div className="lg:col-span-5 lg:sticky lg:top-8">
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
