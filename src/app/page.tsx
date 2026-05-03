"use client";
import { CartDrawer } from "@/components/cartdrawer";
import { CategoryChips } from "@/components/categorychips";
import { CheckoutModal } from "@/components/checkoutmodal";
import { MyOrders } from "@/components/myorders";
import { OrderTracking } from "@/components/ordertracking";
import { ProductCard } from "@/components/productcard";
import { ReceiptModal } from "@/components/receiptmodal";
import { ReviewModal } from "@/components/reviewmodal";
import { SearchBar } from "@/components/searchbar";
import { SectionHeader } from "@/components/sectionheader";
import { HorizontalScrollSection } from "@/components/horizontalscrollsection";
import { VIEW_TYPE } from "@/config/app.config";
import { useItem } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loadingscreen";
import { Coffee, CookingPot, CupSoda, DollarSign, Hamburger, Inbox, Receipt, School, ShoppingCart, Sparkles, TrendingUp } from "lucide-react";
import { useState, useCallback } from "react";
import { EmptyState } from "@/components/emptystate";

export default function App() {
  // ... existing state ...
  // ... (skipping some lines for brevity in thought, but I will provide the full block)
  // const [view, setView] = useState<'feed' | 'tracking' | 'orders'>('feed');
  // const [cartOpen, setCartOpen] = useState(false);
  // const [checkoutOpen, setCheckoutOpen] = useState(false);
  // const [receiptOpen, setReceiptOpen] = useState(false);
  // const [reviewOpen, setReviewOpen] = useState(false);
  // const [cart, setCart] = useState<CartItem[]>([]);
  // const [orders, setOrders] = useState<Order[]>([]);
  // const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  // const [searchQuery, setSearchQuery] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState('all');

  const { isLoading: isAuthLoading } = useAuth();
  const { items, isLoading, isFetching } = useItem()
  const [view, setView] = useState<(typeof VIEW_TYPE)[keyof typeof VIEW_TYPE]>(VIEW_TYPE.FEED);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  if (isAuthLoading || isLoading || isFetching) return <LoadingScreen />;

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleAddToCart = (id: string) => {
    setCartOpen(true);
    // Add logic to update cart
  }



  // if (view === VIEW_TYPE.TRACKING) {
  //   return (
  //     <>
  //       <OrderTracking
  //         orderId={trackingOrder.orderId}
  //         status={trackingOrder.status}
  //         items={trackingOrder.items}
  //         total={trackingOrder.total}
  //         customerName={trackingOrder.customerName}
  //         paymentMethod={trackingOrder.paymentMethod}
  //         deliveryNote={trackingOrder.deliveryNote}
  //         timestamp={trackingOrder.timestamp}
  //         onBack={handleBackToFeed}
  //         onReview={trackingOrder.status === 'completed' && !trackingOrder.reviewed ? handleOpenReview : undefined}
  //       />
  //       <ReviewModal
  //         isOpen={reviewOpen}
  //         onClose={() => setReviewOpen(false)}
  //         orderId={trackingOrder.orderId}
  //         onSubmitReview={handleSubmitReview}
  //       />
  //     </>
  //   );
  // }

  // if (view === VIEW_TYPE.ORDERS) {
  //   return (
  //     <MyOrders
  //       orders={orders}
  //       onBack={handleBackToFeed}
  //       onViewOrder={(orderId) => {
  //         const order = orders.find(o => o.id === orderId);
  //         if (order) {
  //           setCurrentOrder(order);
  //           setView(VIEW_TYPE.TRACKING);
  //         }
  //       }}
  //     />
  //   );
  // }

  const allFlattenedItems = items.flatMap(stall => {
    return stall.items.map(item => {
      const itemReviews = stall.reviews.filter(r => r.itemId === item.id);
      const avgRating = itemReviews.length > 0
        ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
        : 0;

      return {
        ...item,
        id: String(item.id),
        stock: item.stocks,
        stallName: stall.name || `Stall ${stall.id}`,
        stallImage: stall.image ?? null,
        rating: avgRating,
        reviewCount: itemReviews.length,
        image: typeof item.image === 'string' ? item.image : '',
      };
    });
  });

  const categoryMap: Record<string, string> = {
    meals: 'MEAL',
    drinks: 'DRINK',
    snacks: 'SNACK',
    business: 'SCHOOL_ITEM',
  };

  const scopedItems = (selectedCategory === 'all'
    ? allFlattenedItems
    : allFlattenedItems.filter(i => i.category === categoryMap[selectedCategory]))
    .filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase()) ||
      item.stallName?.toLowerCase().includes(search.toLowerCase())
    );

  const trendingItems = scopedItems.filter(item => item.rating >= 4);
  const today = new Date().toDateString();
  const freshDrops = scopedItems.filter(item => item.createdAt && new Date(item.createdAt).toDateString() === today);
  const budgetPicks = scopedItems.filter(item => item.price <= 50);

  return (
    <div className="min-h-screen">
      <SearchBar
        items={allFlattenedItems}
        onSearch={handleSearch}
        liveSearch={true}
      />


      {/* order */}
      {/* <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-3">
        {orders.length > 0 && (
          <button
            onClick={handleViewOrdersList}
            className="bg-white text-gray-800 p-4 rounded-full shadow-lg hover:bg-gray-100 transition-all hover:scale-110 border border-gray-200"
          >
            <Receipt className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={() => setCartOpen(true)}
          className="relative bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 space-y-8">
        <CategoryChips onCategoryChange={setSelectedCategory} />

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
          <HorizontalScrollSection
            icon={<School className="w-6 h-6 text-blue-500" />}
            title="School Items"
            subtitle="Explore all available school items"
            items={allFlattenedItems.filter(i => i.category === 'SCHOOL_ITEM')}
            emptyIcon={Inbox}
            emptyTitle="No school items found"
            emptyDescription="No school items available at the moment!"
            onAddToCart={handleAddToCart}
          />
        )}
      </div>


      {/* 
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
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
      />

      {currentOrder && (
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
      )} */}
    </div>
  );
}


