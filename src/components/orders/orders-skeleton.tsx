'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS & MOCK DATA FOR COMPONENT SELF-CONTAINMENT ---
export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    thumbnail?: string;
}

export interface Order {
    id: string;
    displayId: string;
    timestamp: string;
    status: OrderStatus;
    items: OrderItem[];
    total: number;
    customerName: string;
}

// Minimalist status style mapping utilizing strictly defined design system tokens
const STATUS_STYLES: Record<OrderStatus, { text: string; bg: string }> = {
    Pending: { text: 'text-foreground/80', bg: 'bg-secondary' },
    Preparing: { text: 'text-orange-500', bg: 'bg-accent' },
    Ready: { text: 'text-orange-500 font-medium', bg: 'bg-accent border border-orange-500/20' },
    Completed: { text: 'text-foreground/60', bg: 'bg-secondary/60' },
    Cancelled: { text: 'text-foreground/40', bg: 'bg-secondary/40' },
};

// --- FRAMER MOTION CONFIGURATIONS (Subtle & Fast) ---
const containerVariants = {
    animate: { transition: { staggerChildren: 0.04 } }
};

const cardVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
    hover: { y: -2, transition: { duration: 0.15, ease: 'easeInOut' as const } }
};


// --- SKELETON COMPONENTS ---
function pulse(delay = 0) {
    return {
        animate: { opacity: [0.4, 0.7, 0.4] },
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const, delay },
    };
}

function SkeletonBox({ className }: { className: string }) {
    return (
        <motion.div
            {...pulse()}
            className={`bg-border rounded-md ${className}`}
        />
    );
}

function SkeletonCard({ index }: { index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="border border-border rounded-lg bg-card"
        >
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SkeletonBox className="w-8 h-8 rounded-md shrink-0" />
                    <div className="space-y-1">
                        <SkeletonBox className="h-3.5 w-24" />
                        <SkeletonBox className="h-2.5 w-16" />
                    </div>
                </div>
                <SkeletonBox className="h-6 w-16 rounded-md" />
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <SkeletonBox className="h-4 w-32" />
                    <SkeletonBox className="h-4 w-12" />
                </div>
            </div>

            <div className="px-4 py-3 bg-secondary/30 border-t border-border flex items-center justify-between">
                <SkeletonBox className="h-4 w-20" />
                <div className="flex gap-2">
                    <SkeletonBox className="h-8 w-16 rounded-md" />
                </div>
            </div>
        </motion.div>
    );
}

export function OrdersPageSkeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <header className="sticky top-0 z-30 bg-background border-b border-border">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonBox key={i} className="h-8 w-20 shrink-0 rounded-md" />
                    ))}
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-4 md:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(i => (
                        <SkeletonCard key={i} index={i} />
                    ))}
                </div>
            </main>
        </div>
    );
}
