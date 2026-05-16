'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/hooks/use-auth';
import { ShoppingBag, Clock, Inbox, ChevronRight, X, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { useMemo } from 'react';
import { getRelativeTime, groupByTime } from '@/lib/utils/time';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string | Date;
    link: string;
    status: string;
    type?: string;
}

export default function NotificationsPage() {
    const { isLoading: isAuthLoading } = useAuth();
    const { notifications, isLoading, dismissNotification, clearAll } = useNotifications({
        refetchInterval: 30000,
        staleTime: 1000 * 60,
    });

    const grouped = useMemo(() => groupByTime(notifications), [notifications]);
    const hasNotifications = notifications && notifications.length > 0;

    if (isAuthLoading || (isLoading && !notifications.length)) return <Loading />;

    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-orange-500/20">
            <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 md:px-5">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Bell className="h-4 w-4 text-foreground" />
                            {notifications?.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-sm bg-orange-500" />
                            )}
                        </div>
                        <h1 className="text-base font-medium tracking-tight">Notifications</h1>
                    </div>
                    
                    {hasNotifications && (
                        <button
                            onClick={clearAll}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            </header>
            <main className="mx-auto max-w-2xl px-4 py-6 md:px-5">
                {!hasNotifications ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                            <Inbox className="h-5 w-5" />
                        </div>
                        <h2 className="mt-3 text-sm font-medium">All caught up</h2>
                        <p className="mt-1 text-xs text-secondary-foreground max-w-[240px]">
                            You don't have any notifications right now.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {grouped.map(({ label: timeframe, items }) => {
                            const validItems = items as NotificationItem[];
                            if (validItems.length === 0) return null;

                            return (
                                <section key={timeframe} className="space-y-2">
                                    <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-secondary-foreground/70">
                                        {timeframe}
                                    </h2>
                                    
                                    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {validItems.map((notification) => (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -8 }}
                                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                                    className="group relative flex items-start gap-3 p-4 transition-colors bg-accent/40"
                                                >
                                                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-orange-500" />

                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground border border-border">
                                                        {notification.type === 'order' ? (
                                                            <ShoppingBag className="h-4 w-4" />
                                                        ) : (
                                                            <Clock className="h-4 w-4" />
                                                        )}
                                                    </div>

                                                    {/* Content Mapping */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <h3 className="text-sm truncate font-medium text-foreground">
                                                                    {notification.title}
                                                                </h3>
                                                                {notification.status && (
                                                                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                                        notification.status.toUpperCase() === 'READY' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                                        notification.status.toUpperCase() === 'PREPARING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                                                        notification.status.toUpperCase() === 'COMPLETED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                                        notification.status.toUpperCase() === 'CANCELLED' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                                        'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                                                    }`}>
                                                                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1).toLowerCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="shrink-0 text-[11px] text-secondary-foreground whitespace-nowrap pt-0.5">
                                                                {getRelativeTime(notification.time)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-xs text-secondary-foreground line-clamp-2 leading-relaxed">
                                                            {notification.message}
                                                        </p>
                                                    </div>

                                                    {/* Action Controls */}
                                                    <div className="flex shrink-0 items-center self-center pl-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                dismissNotification(notification.id);
                                                            }}
                                                            className="rounded-md p-1 text-secondary-foreground/60 transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                            aria-label="Dismiss notification"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}