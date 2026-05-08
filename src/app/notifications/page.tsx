'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { ShoppingBag, Clock, Inbox, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { useMemo } from 'react';
import { getRelativeTime, groupByTime } from '@/lib/utils/time';
import { STATUS } from '@/config/track.config';

export default function NotificationsPage() {
    const router = useRouter();
    const { notifications, isLoading, dismissNotification, clearAll } = useNotifications();

    const grouped = useMemo(() => groupByTime(notifications), [notifications]);

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-end">
                    <button
                        onClick={clearAll}
                        className="text-[10px] font-black text-neutral-500 uppercase tracking-widest"
                    >
                        Mark all as read
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {grouped.length > 0 ? (
                    <div className="space-y-8">
                        {grouped.map((group) => (
                            <section key={group.label}>
                                {/* Time Group Separator */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300">
                                        {group.label}
                                    </span>
                                    <div className="flex-1 h-px bg-neutral-100" />
                                </div>

                                <div className="space-y-3">
                                    {group.items.map((notif) => {
                                        const statusConfig = STATUS[(notif as any).status?.toUpperCase()];
                                        const StatusIcon = statusConfig?.icon || ShoppingBag;
                                        const statusBg = statusConfig?.bgColor || 'bg-orange-500';
                                        const statusShadow = statusConfig?.bgColor
                                            ? statusConfig.bgColor.replace('bg-', 'shadow-') + '/20'
                                            : 'shadow-orange-500/20';

                                        return (
                                            <div key={notif.id} className="relative group">
                                                <button
                                                    onClick={() => notif.link && router.push(notif.link)}
                                                    className="w-full text-left flex gap-4 p-5 border bg-neutral-50/50 border-neutral-100 transition-all duration-300"
                                                >
                                                    <div className={`shrink-0 w-12 h-12 ${statusBg} rounded-2xl flex items-center justify-center ${statusShadow}`}>
                                                        <StatusIcon className="w-6 h-6 text-white" />
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                                    {notif.type}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {getRelativeTime(notif.time)}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-sm font-black text-neutral-900">
                                                            {notif.title}
                                                        </h3>
                                                        <p className="text-xs font-medium text-neutral-500 leading-relaxed line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dismissNotification(notif.id);
                                                    }}
                                                    className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-neutral-100 shadow-sm rounded-full flex items-center justify-center text-neutral-400 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10 hover:!bg-rose-50 hover:!text-rose-500 hover:!border-rose-100 hover:scale-110"
                                                >
                                                    <X className="w-4 h-4" strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                            <Inbox className="w-8 h-8 text-neutral-200" />
                        </div>
                        <h3 className="text-lg font-black text-neutral-900">All caught up!</h3>
                        <p className="text-sm font-medium text-neutral-400 max-w-xs mt-2">
                            You have no new notifications at the moment.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
