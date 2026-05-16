'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { CreditCard, Truck, Store, MapPin, Wallet, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
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

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
            staggerChildren: 0.05
        } as const
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { profile, isLoading: isAuthLoading } = useAuth();
    const { cartItems, stalledItems, isLoading: isCartLoading } = useCart();
    const { items: allStalls, isLoading: isItemsLoading } = useItem();

    const isBuyNow = searchParams.get('buyNow') === 'true';
    const isLoading = isBuyNow ? isItemsLoading : (isCartLoading || isItemsLoading);

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

    if (isAuthLoading || (isLoading && !checkoutItems.length)) return <Loading />;

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
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-orange-500/20">
            {receipt}

            <motion.main 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-4 lg:px-8 py-6 md:py-12"
            >
                {/* Top Header */}
                <motion.header variants={itemVariants} className="mb-6 md:mb-10 pb-4 border-b border-border">
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                        Checkout
                    </h1>
                </motion.header>

                {/* Checkout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Input Stream */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Fulfillment Picker */}
                        <motion.div variants={itemVariants}>
                            <CheckoutSection icon={MapPin} color="text-orange-500" title="Fulfillment Method">
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <OptionCard
                                        active={isDeliver}
                                        onClick={() => setDeliveryMethod('deliver')}
                                        icon={Truck}
                                        label="Delivery"
                                        subtitle="To your coordinates"
                                        className={`rounded-lg border bg-card p-4 transition-colors ${
                                            isDeliver ? 'border-orange-500 ring-1 ring-orange-500' : 'border-border'
                                        }`}
                                    />
                                    <OptionCard
                                        active={!isDeliver}
                                        onClick={() => setDeliveryMethod('pickup')}
                                        icon={Store}
                                        label="Pickup"
                                        subtitle="Collect at merchant"
                                        className={`rounded-lg border bg-card p-4 transition-colors ${
                                            !isDeliver ? 'border-orange-500 ring-1 ring-orange-500' : 'border-border'
                                        }`}
                                    />
                                </div>
                            </CheckoutSection>
                        </motion.div>

                        {/* Payment */}
                        <motion.div variants={itemVariants}>
                            <CheckoutSection icon={CreditCard} color="text-orange-500" title="Payment Method">
                                <div className="mt-2 flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center shrink-0 border border-border">
                                        <Wallet className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-medium text-foreground block">
                                            {isDeliver ? 'Cash on Delivery' : 'Pay at Counter'}
                                        </span>
                                        <span className="text-xs text-muted-foreground block">
                                            Settlement prioritized upon item transfer
                                        </span>
                                    </div>
                                </div>
                            </CheckoutSection>
                        </motion.div>

                        {/* Delivery Notes */}
                        <motion.div variants={itemVariants}>
                            <CheckoutSection
                                icon={MessageSquare}
                                color={isDeliver && !message ? 'text-orange-500' : 'text-muted-foreground'}
                                title="Order Notes"
                                badge={isDeliver ? 'Required' : 'Optional'}
                            >
                                <div className="mt-2 space-y-1.5">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder={
                                            isDeliver
                                                ? 'Specify building, room, or delivery instructions...'
                                                : 'Special requests or preferences...'
                                        }
                                        maxLength={200}
                                        rows={3}
                                        className={`w-full bg-input border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all resize-none focus:ring-1 ${
                                            isDeliver && !message
                                                ? 'border-orange-500/60 focus:ring-orange-500 focus:border-orange-500'
                                                : 'border-border focus:ring-ring focus:border-border'
                                        }`}
                                    />
                                    <div className="flex justify-end">
                                        <span className={`text-xs font-mono tracking-wide ${
                                            message.length > 180 || (isDeliver && !message) ? 'text-orange-500' : 'text-muted-foreground'
                                        }`}>
                                            {message.length}/200
                                        </span>
                                    </div>
                                </div>
                            </CheckoutSection>
                        </motion.div>

                        {/* Inline Mobile Only Structured */}
                        <motion.section variants={itemVariants} className="lg:hidden space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Items</h2>
                                <span className="text-xs font-medium text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                            </div>
                            <div className="bg-card border border-border rounded-lg p-4">
                                <CheckoutItemList groups={checkoutGroups} />
                            </div>
                        </motion.section>
                    </div>

                    {/* Summary Card */}
                    <motion.div variants={itemVariants} className="lg:col-span-5 lg:sticky lg:top-6">
                        <div className="bg-card border border-border rounded-lg p-4 md:p-5">
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
                    </motion.div>
                </div>
            </motion.main>
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