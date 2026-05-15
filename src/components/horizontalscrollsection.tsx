"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { ProductCard } from "./productcard";
import { SectionHeader } from "./sectionheader";
import { EmptyState } from "./emptystate";
import { LucideIcon } from "lucide-react";

const INITIAL_COUNT = 5;
const BATCH_SIZE = 5;

interface HorizontalScrollSectionProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  items: any[];
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  priorityFirstItem?: boolean;
}

export function HorizontalScrollSection({
  icon,
  title,
  subtitle,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  priorityFirstItem = false,
}: HorizontalScrollSectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [items]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, items.length));
        }
      },
      { root: sentinel.closest(".scroll-container"), threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <section className="space-y-6">
      {/* Header - Balanced for both mobile and desktop */}
      <div className="px-1">
        <SectionHeader 
          icon={icon} 
          title={title} 
          subtitle={subtitle} 
        />
      </div>

      {items.length > 0 ? (
        <div className="scroll-container relative group">
          <div className="flex overflow-x-auto gap-3 md:gap-5 pb-4 -mx-4 px-4 no-scrollbar scroll-smooth">
            {visibleItems.map((product, index) => (
              <div 
                key={product.id} 
                className="w-[140px] xs:w-[160px] md:w-[200px] shrink-0"
              >
                <ProductCard
                  item={product as any}
                  image={product.image}
                  stallImage={product.stallImage}
                  priority={priorityFirstItem && index === 0}
                />
              </div>
            ))}
            
            {hasMore && (
              <div ref={sentinelRef} className="flex gap-3 md:gap-5">
                <div className="w-[140px] xs:w-[160px] md:w-[200px] shrink-0">
                  <SkeletonCard />
                </div>
                <div className="w-[140px] xs:w-[160px] md:w-[200px] shrink-0">
                  <SkeletonCard />
                </div>
              </div>
            )}
            
            {/* Visual Spacer for scroll-end */}
            <div className="w-4 shrink-0" />
          </div>
        </div>
      ) : (
        /* Minimalist Empty State with subtle border */
        <div className="border border-border rounded-lg bg-card/50 py-10">
          <EmptyState 
            icon={emptyIcon} 
            title={emptyTitle} 
            description={emptyDescription} 
          />
        </div>
      )}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full">
      <div className="aspect-square bg-secondary animate-pulse" />
      <div className="p-3 space-y-3">
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded w-3/4 animate-pulse" />
          <div className="h-2 bg-secondary/60 rounded w-1/2 animate-pulse" />
        </div>
        <div className="pt-1">
          <div className="h-3 bg-secondary rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}