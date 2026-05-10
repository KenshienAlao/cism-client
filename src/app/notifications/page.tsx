'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { ShoppingBag, Clock, Inbox, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { useMemo } from 'react';
import { getRelativeTime, groupByTime } from '@/lib/utils/time';
import { STATUS } from '@/config/track.config';
import NotifHeader from '@/components/notification/notif-header';
import { NotifMain } from '@/components/notification/notif-main';

export default function NotificationsPage() {
    const router = useRouter();
    const { notifications, isLoading, dismissNotification, clearAll } = useNotifications();

    const grouped = useMemo(() => groupByTime(notifications), [notifications]);

    if (isLoading) return <Loading />;

    return (
        <div className="min-h-screen bg-neutral-50 pb-32">
            {/* header */}
            <NotifHeader clearAll={clearAll} />

            <main className="max-w-2xl mx-auto px-4 py-8">
               <NotifMain grouped={grouped} dismissNotification={dismissNotification} />
            </main>
        </div>
    );
}
