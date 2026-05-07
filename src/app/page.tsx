"use client";
import { CategoryChips } from "@/components/categorychips";
import { useEnrichedItems } from "@/hooks/use-enriched-items";
import { HorizontalScrollSection } from "@/components/horizontalscrollsection";
import { VIEW_TYPE, CATEGORY_MAP } from "@/config/app.config";
import { useItem } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import Loading from "@/components/ui/loading";
import { Coffee, CookingPot, CupSoda, DollarSign, Hamburger, Inbox, School, Sparkles, TrendingUp } from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import Cart from "@/components/cart";
import { useCartDrawer } from "@/context/cart.context";

import { useSearchParams } from "next/navigation";

function HomeContent() {
  const { isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const { items, isLoading, isFetching } = useItem()
  const allFlattenedItems = useEnrichedItems(items);
  const { cartCount, addToCart } = useCart();
  const { openCart } = useCartDrawer();
  const [view, setView] = useState<(typeof VIEW_TYPE)[keyof typeof VIEW_TYPE]>(VIEW_TYPE.FEED);
  const search = searchParams.get('q') || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orders, setOrders] = useState<any[]>([]);

  const handleViewOrdersList = () => {
    setView(VIEW_TYPE.ORDERS);
  };

  if (isAuthLoading || isLoading || isFetching) return <Loading />;

  const handleAddToCart = (id: string) => {
    const item = allFlattenedItems.find(i => i.id === id);
    if (!item) return;

    addToCart({
      stallId: Number(item.stallId),
      stallItemId: Number(item.id),
      variationId: 0, // Default to no variation for direct add
      quantity: 1
    });
    openCart();
  };

  const isSpecialCategory = ['all', 'popular', 'fresh', 'budget'].includes(selectedCategory);
  const scopedItems = (search.trim() !== ''
    ? allFlattenedItems
    : isSpecialCategory
      ? allFlattenedItems
      : allFlattenedItems.filter(i => i.category === CATEGORY_MAP[selectedCategory]))
    .filter(item => {
      if (!search.trim()) return true;
      const s = search.toUpperCase();
      return item.name?.toUpperCase().includes(s) ||
        item.category?.toUpperCase().includes(s) ||
        item.stallName?.toUpperCase().includes(s);
    });


  console.log(items);

  const schoolItems = useMemo(() =>
    allFlattenedItems.filter(i => i.category !== 'MEAL' && i.category !== 'DRINK' && i.category !== 'SNACK'),
    [allFlattenedItems]
  );

  const schoolItemsByCategory = useMemo(() => {
    return schoolItems.reduce((acc, item) => {
      const cat = item.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [schoolItems]);

  const trendingItems = useMemo(() =>
    scopedItems.filter(item => item.rating >= 4 && item.reviewCount >= 10),
    [scopedItems]
  );

  const freshDrops = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    return scopedItems.filter(item => item.createdAt && new Date(item.createdAt) >= twentyFourHoursAgo);
  }, [scopedItems]);

  const budgetPicks = useMemo(() =>
    scopedItems.filter(item => item.price <= 50 && item.stallRole === 'STALL'),
    [scopedItems]
  );

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <Cart
        orders={orders}
        handleViewOrdersList={handleViewOrdersList}
        cartCount={cartCount}
        setCartOpen={(isOpen) => isOpen ? openCart() : null}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-10">
        <CategoryChips onCategoryChange={setSelectedCategory} />

        {(selectedCategory === 'all' || selectedCategory === 'popular') && (
          <HorizontalScrollSection
            icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
            title="Trending Now"
            subtitle="Most popular items on campus"
            items={trendingItems}
            emptyIcon={TrendingUp}
            emptyTitle="Nothing trending yet"
            emptyDescription="No popular items found at the moment."
            onAddToCart={handleAddToCart}
          />

        )}

        {(selectedCategory === 'all' || selectedCategory === 'fresh') && (
          <HorizontalScrollSection
            icon={<Sparkles className="w-6 h-6 text-blue-500" />}
            title="Fresh Drops"
            subtitle="New items added today"
            items={freshDrops}
            emptyIcon={Coffee}
            emptyTitle="No fresh drops found"
            emptyDescription="No items added today. Check back later!"
            onAddToCart={handleAddToCart}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'budget') && (
          <HorizontalScrollSection
            icon={<DollarSign className="w-6 h-6 text-green-500" />}
            title="Budget Picks"
            subtitle="Delicious finds under Php 50"
            items={budgetPicks}
            emptyIcon={Inbox}
            emptyTitle="No budget picks found"
            emptyDescription="No items under Php 50 right now."
            onAddToCart={handleAddToCart}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'meals') && (
          <HorizontalScrollSection
            icon={<CookingPot className="w-6 h-6 text-orange-500" />}
            title="Meals"
            subtitle="Explore all available meals"
            items={allFlattenedItems.filter(i => i.category === 'MEAL')}
            emptyIcon={Inbox}
            emptyTitle="No meals found"
            emptyDescription="No meals available at the moment!"
            onAddToCart={handleAddToCart}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'drinks') && (
          <HorizontalScrollSection
            icon={<CupSoda className="w-6 h-6 text-blue-500" />}
            title="Drinks"
            subtitle="Explore all available drinks"
            items={allFlattenedItems.filter(i => i.category === 'DRINK')}
            emptyIcon={Inbox}
            emptyTitle="No drinks found"
            emptyDescription="No drinks available at the moment!"
            onAddToCart={handleAddToCart}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'snacks') && (
          <HorizontalScrollSection
            icon={<Hamburger className="w-6 h-6 text-orange-500" />}
            title="Snacks"
            subtitle="Explore all available snacks"
            items={allFlattenedItems.filter(i => i.category === 'SNACK')}
            emptyIcon={Inbox}
            emptyTitle="No snacks found"
            emptyDescription="No snacks available at the moment!"
            onAddToCart={handleAddToCart}
          />
        )}

        {(selectedCategory === 'all' || selectedCategory === 'business') && (
          selectedCategory === 'business' ? (
            <div className="space-y-10 pt-4">
              {Object.entries(schoolItemsByCategory).map(([category, catItems]) => (
                <HorizontalScrollSection
                  key={category}
                  icon={<School className="w-6 h-6 text-indigo-500" />}
                  title={category.replace(/_/g, ' ')}
                  subtitle={`Explore all available ${category.replace(/_/g, ' ')} items.`}
                  items={catItems}
                  emptyIcon={Inbox}
                  emptyTitle="No items found"
                  emptyDescription="Nothing available in this category."
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <HorizontalScrollSection
              icon={<School className="w-6 h-6 text-indigo-500" />}
              title="School Items"
              subtitle="Uniforms, IDs, and campus essentials"
              items={schoolItems}
              emptyIcon={Inbox}
              emptyTitle="No school items found"
              emptyDescription="No school items available at the moment!"
              onAddToCart={handleAddToCart}
            />
          )
        )}
      </div>

      {/* <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          stallName: item.stallName,
        }))}
        onConfirmOrder={handleConfirmOrder}
      /> */}

      {/* {currentOrder && (
        <ReceiptModal
          isOpen={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          orderId={currentOrder.orderId}
          items={currentOrder.items}
          total={currentOrder.total}
          customerName={currentOrder.customerName}
          paymentMethod={currentOrder.paymentMethod}
          deliveryNote={currentOrder.deliveryNote}
          timestamp={currentOrder.timestamp}
          onViewOrder={() => handleViewOrder()}
        />
      )}  */}
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}


