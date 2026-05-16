"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { ProductCard } from "./productcard";
import { SectionHeader } from "./sectionheader";
import { EmptyState } from "./emptystate";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="space-y-4">
        <SectionHeader 
          icon={icon} 
          title={title} 
          subtitle={subtitle} 
        />

      {items.length > 0 ? (
        <div className="scroll-container relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
            {visibleItems.map((product, index) => (
              <motion.div 
                key={product.id} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0 snap-start"
              >
                <ProductCard
                  item={product as any}
                  image={product.image}
                  stallImage={product.stallImage}
                  priority={priorityFirstItem && index === 0}
                />
              </motion.div>
            ))}
            
            {hasMore && (
              <div ref={sentinelRef} className="flex gap-3 shrink-0">
                <div className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0">
                  <SkeletonCard />
                </div>
                <div className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0">
                  <SkeletonCard />
                </div>
              </div>
            )}
            <div className="w-1 shrink-0" />
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg bg-card py-8 px-4 flex items-center justify-center text-center">
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
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col">
      <div className="aspect-square bg-secondary/70" />
      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="h-3 bg-secondary rounded w-11/12" />
          <div className="h-2.5 bg-secondary/50 rounded w-7/12" />
        </div>
        <div className="h-3 bg-secondary rounded w-5/12" />
      </div>
    </div>
  );
}