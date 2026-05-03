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
  onAddToCart: (id: string) => void;
}

export function HorizontalScrollSection({
  icon,
  title,
  subtitle,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  onAddToCart,
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
      { root: sentinel.closest(".scroll-container"), threshold: 0.5 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <section>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} />

      {items.length > 0 ? (
        <div className="scroll-container flex overflow-x-auto gap-3 pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleItems.map((product) => (
            <div key={product.id} className="w-40 shrink-0">
              <ProductCard
                item={product as any}
                image={product.image}
                stallImage={product.stallImage}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
          {hasMore && (
            <>
              <div ref={sentinelRef} className="w-40 shrink-0">
                <SkeletonCard />
              </div>
              <div className="w-40 shrink-0">
                <SkeletonCard />
              </div>
            </>
          )}
        </div>
      ) : (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-card rounded-[--radius] overflow-hidden shadow-sm animate-pulse border border-border">
      <div className="aspect-square bg-muted/20" />
      <div className="p-3 space-y-2.5">
        <div className="h-2.5 bg-muted/20 rounded-full w-3/4" />
        <div className="h-2.5 bg-muted/20 rounded-full w-1/2" />
        <div className="h-2.5 bg-muted/20 rounded-full w-2/3" />
        <div className="h-5 bg-muted/20 rounded-full w-1/2 mt-1" />
      </div>
    </div>
  );
}
