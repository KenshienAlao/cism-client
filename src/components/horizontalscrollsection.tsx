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
}

export function HorizontalScrollSection({
  icon,
  title,
  subtitle,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
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
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <SectionHeader 
          icon={icon} 
          title={title} 
          subtitle={subtitle} 
        />
      </div>

      {items.length > 0 ? (
        <div className="scroll-container relative">
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
            {visibleItems.map((product) => (
              <div 
                key={product.id} 
                className="w-[160px] md:w-[180px] shrink-0 transition-opacity duration-300"
              >
                <ProductCard
                  item={product as any}
                  image={product.image}
                  stallImage={product.stallImage}
                />
              </div>
            ))}
            
            {hasMore && (
              <div ref={sentinelRef} className="flex gap-4">
                <div className="w-[160px] md:w-[180px] shrink-0">
                  <SkeletonCard />
                </div>
                <div className="w-[160px] md:w-[180px] shrink-0">
                  <SkeletonCard />
                </div>
              </div>
            )}
            
            {/* Minimalist spacer for end-of-scroll balance */}
            <div className="w-1 shrink-0" />
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-neutral-200 rounded-lg bg-neutral-50/30">
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
    <div className="bg-white border border-neutral-100 rounded-lg overflow-hidden h-full">
      <div className="aspect-square bg-neutral-100 animate-pulse" />
      <div className="p-3 space-y-3">
        <div className="space-y-2">
          <div className="h-2.5 bg-neutral-100 rounded-md w-3/4 animate-pulse" />
          <div className="h-2 bg-neutral-50 rounded-md w-1/2 animate-pulse" />
        </div>
        <div className="pt-2">
          <div className="h-4 bg-neutral-100 rounded-md w-1/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}