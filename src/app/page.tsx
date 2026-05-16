"use client";

import { CategoryChips } from "@/components/categorychips";
import { useEnrichedItems } from "@/hooks/use-enriched-items";
import { HorizontalScrollSection } from "@/components/horizontalscrollsection";
import { CATEGORY_MAP } from "@/config/app.config";
import { useItem } from "@/hooks/use-item";
import { useAuth } from "@/hooks/use-auth";
import Loading from "@/components/ui/loading";
import { 
  Coffee, 
  CookingPot, 
  CupSoda, 
  DollarSign, 
  Hamburger, 
  Inbox, 
  School, 
  Sparkles, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const faderVariants = {
  hidden: { opacity: 0 } as const,
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } as const },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } as const }
};

function HomeContent() {
  const { isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const { items: allFlattenedItems, isLoading } = useEnrichedItems();
  const search = searchParams.get('q') || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isActuallyLoading = isAuthLoading || (isLoading && (!allFlattenedItems || allFlattenedItems.length === 0));
  if (isActuallyLoading) return <Loading />;

  const isSpecialCategory = ['all', 'popular', 'fresh', 'budget'].includes(selectedCategory);
  
  const scopedItems = useMemo(() => {
    return (search.trim() !== ''
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
  }, [allFlattenedItems, search, selectedCategory, isSpecialCategory]);

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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return scopedItems.filter(item => item.createdAt && new Date(item.createdAt) >= twentyFourHoursAgo);
  }, [scopedItems]);

  const budgetPicks = useMemo(() =>
    scopedItems.filter(item => item.price <= 50 && item.stallRole === 'STALL'),
    [scopedItems]
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={faderVariants}
      className="min-h-screen bg-background text-foreground antialiased selection:bg-orange-500/20"
    >
      <nav className="sticky top-0 z-40 bg-background border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 justify-between gap-4">
            <div className="flex-1 overflow-x-auto no-scrollbar py-2">
              <CategoryChips onCategoryChange={setSelectedCategory} />  
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCategory}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-8 lg:space-y-12"
          >
            <div className="grid grid-cols-1 gap-8 lg:gap-10">
              {(selectedCategory === 'all' || selectedCategory === 'popular') && (
                <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                  <HorizontalScrollSection
                    icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
                    title="Trending Now"
                    subtitle="Most popular items on campus"
                    items={trendingItems}
                    emptyIcon={TrendingUp}
                    emptyTitle="Nothing trending yet"
                    emptyDescription="No popular items found at the moment."
                    priorityFirstItem
                  />
                </div>
              )}

              {(selectedCategory === 'all' || selectedCategory === 'fresh') && (
                <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                  <HorizontalScrollSection
                    icon={<Sparkles className="w-4 h-4 text-orange-500" />}
                    title="Fresh Drops"
                    subtitle="New items added today"
                    items={freshDrops}
                    emptyIcon={Coffee}
                    emptyTitle="No fresh drops found"
                    emptyDescription="No items added today. Check back later!"
                  />
                </div>
              )}

              {(selectedCategory === 'all' || selectedCategory === 'budget') && (
                <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                  <HorizontalScrollSection
                    icon={<DollarSign className="w-4 h-4 text-orange-500" />}
                    title="Budget Picks"
                    subtitle="Delicious finds under Php 50"
                    items={budgetPicks}
                    emptyIcon={Inbox}
                    emptyTitle="No budget picks found"
                    emptyDescription="No items under Php 50 right now."
                  />
                </div>
              )}
            </div>
            {(selectedCategory === 'all' || selectedCategory === 'meals' || selectedCategory === 'drinks' || selectedCategory === 'snacks') && (
              <div className="pt-6 border-t border-border space-y-8 lg:space-y-10">
                {(selectedCategory === 'all' || selectedCategory === 'meals') && (
                  <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                    <HorizontalScrollSection
                      icon={<CookingPot className="w-4 h-4 text-orange-500" />}
                      title="Meals"
                      subtitle="Explore all available meals"
                      items={allFlattenedItems.filter(i => i.category === 'MEAL')}
                      emptyIcon={Inbox}
                      emptyTitle="No meals found"
                      emptyDescription="No meals available at the moment!"
                    />
                  </div>
                )}

                {(selectedCategory === 'all' || selectedCategory === 'drinks') && (
                  <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                    <HorizontalScrollSection
                      icon={<CupSoda className="w-4 h-4 text-orange-500" />}
                      title="Drinks"
                      subtitle="Explore all available drinks"
                      items={allFlattenedItems.filter(i => i.category === 'DRINK')}
                      emptyIcon={Inbox}
                      emptyTitle="No drinks found"
                      emptyDescription="No drinks available at the moment!"
                    />
                  </div>
                )}

                {(selectedCategory === 'all' || selectedCategory === 'snacks') && (
                  <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                    <HorizontalScrollSection
                      icon={<Hamburger className="w-4 h-4 text-orange-500" />}
                      title="Snacks"
                      subtitle="Explore all available snacks"
                      items={allFlattenedItems.filter(i => i.category === 'SNACK')}
                      emptyIcon={Inbox}
                      emptyTitle="No snacks found"
                      emptyDescription="No snacks available at the moment!"
                    />
                  </div>
                )}
              </div>
            )}
            {(selectedCategory === 'all' || selectedCategory === 'business') && (
              <div className="pt-6 border-t border-border">
                {selectedCategory === 'business' ? (
                  <div className="space-y-8 lg:space-y-10">
                    {Object.entries(schoolItemsByCategory).map(([category, catItems]) => (
                      <div key={category} className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                        <HorizontalScrollSection
                          icon={<School className="w-4 h-4 text-orange-500" />}
                          title={category.replace(/_/g, ' ')}
                          subtitle={`Explore all available ${category.replace(/_/g, ' ')} items.`}
                          items={catItems}
                          emptyIcon={Inbox}
                          emptyTitle="No items found"
                          emptyDescription="Nothing available in this category."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-4 lg:p-5 transition-all duration-200">
                    <HorizontalScrollSection
                      icon={<School className="w-4 h-4 text-orange-500" />}
                      title="School Items"
                      subtitle="Uniforms, IDs, and campus essentials"
                      items={schoolItems}
                      emptyIcon={Inbox}
                      emptyTitle="No school items found"
                      emptyDescription="No school items available at the moment!"
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}