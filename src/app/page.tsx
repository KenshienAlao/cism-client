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
  TrendingUp 
} from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const { isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const { items, isLoading, isFetching } = useItem();
  const allFlattenedItems = useEnrichedItems(items);
  const search = searchParams.get('q') || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (isAuthLoading || isLoading || isFetching) return <Loading />;

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 overflow-x-auto no-scrollbar">
            <CategoryChips onCategoryChange={setSelectedCategory} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="space-y-12 md:space-y-16">
          
          {(selectedCategory === 'all' || selectedCategory === 'popular') && (
            <HorizontalScrollSection
              icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
              title="Trending Now"
              subtitle="Most popular items on campus"
              items={trendingItems}
              emptyIcon={TrendingUp}
              emptyTitle="Nothing trending yet"
              emptyDescription="No popular items found at the moment."
              priorityFirstItem
            />
          )}

          {(selectedCategory === 'all' || selectedCategory === 'fresh') && (
            <HorizontalScrollSection
              icon={<Sparkles className="w-5 h-5 text-orange-500" />}
              title="Fresh Drops"
              subtitle="New items added today"
              items={freshDrops}
              emptyIcon={Coffee}
              emptyTitle="No fresh drops found"
              emptyDescription="No items added today. Check back later!"
            />
          )}

          {(selectedCategory === 'all' || selectedCategory === 'budget') && (
            <HorizontalScrollSection
              icon={<DollarSign className="w-5 h-5 text-orange-500" />}
              title="Budget Picks"
              subtitle="Delicious finds under Php 50"
              items={budgetPicks}
              emptyIcon={Inbox}
              emptyTitle="No budget picks found"
              emptyDescription="No items under Php 50 right now."
            />
          )}

          <div className="space-y-12 pt-4 border-t border-border">
            {(selectedCategory === 'all' || selectedCategory === 'meals') && (
              <HorizontalScrollSection
                icon={<CookingPot className="w-5 h-5 text-orange-500" />}
                title="Meals"
                subtitle="Explore all available meals"
                items={allFlattenedItems.filter(i => i.category === 'MEAL')}
                emptyIcon={Inbox}
                emptyTitle="No meals found"
                emptyDescription="No meals available at the moment!"
              />
            )}

            {(selectedCategory === 'all' || selectedCategory === 'drinks') && (
              <HorizontalScrollSection
                icon={<CupSoda className="w-5 h-5 text-orange-500" />}
                title="Drinks"
                subtitle="Explore all available drinks"
                items={allFlattenedItems.filter(i => i.category === 'DRINK')}
                emptyIcon={Inbox}
                emptyTitle="No drinks found"
                emptyDescription="No drinks available at the moment!"
              />
            )}

            {(selectedCategory === 'all' || selectedCategory === 'snacks') && (
              <HorizontalScrollSection
                icon={<Hamburger className="w-5 h-5 text-orange-500" />}
                title="Snacks"
                subtitle="Explore all available snacks"
                items={allFlattenedItems.filter(i => i.category === 'SNACK')}
                emptyIcon={Inbox}
                emptyTitle="No snacks found"
                emptyDescription="No snacks available at the moment!"
              />
            )}
          </div>

          {(selectedCategory === 'all' || selectedCategory === 'business') && (
            <div className="pt-4 border-t border-border">
              {selectedCategory === 'business' ? (
                <div className="space-y-12">
                  {Object.entries(schoolItemsByCategory).map(([category, catItems]) => (
                    <HorizontalScrollSection
                      key={category}
                      icon={<School className="w-5 h-5 text-orange-500" />}
                      title={category.replace(/_/g, ' ')}
                      subtitle={`Explore all available ${category.replace(/_/g, ' ')} items.`}
                      items={catItems}
                      emptyIcon={Inbox}
                      emptyTitle="No items found"
                      emptyDescription="Nothing available in this category."
                    />
                  ))}
                </div>
              ) : (
                <HorizontalScrollSection
                  icon={<School className="w-5 h-5 text-orange-500" />}
                  title="School Items"
                  subtitle="Uniforms, IDs, and campus essentials"
                  items={schoolItems}
                  emptyIcon={Inbox}
                  emptyTitle="No school items found"
                  emptyDescription="No school items available at the moment!"
                />
              )}
            </div>
          )}
        </div>
      </main>
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