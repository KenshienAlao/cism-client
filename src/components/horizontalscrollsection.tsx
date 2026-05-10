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
    <div className="bg-white border border-neutral-100 rounded-md overflow-hidden">
      <div className="aspect-square bg-neutral-50 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-neutral-50 rounded-full w-3/4 animate-pulse" />
        <div className="h-2 bg-neutral-50 rounded-full w-1/2 animate-pulse" />
        <div className="h-2 bg-neutral-50 rounded-full w-2/3 animate-pulse" />
        <div className="h-4 bg-neutral-50 rounded-full w-1/2 mt-1 animate-pulse" />
      </div>
    </div>
  );
}
