import { getRelativeTime } from "@/lib/utils/time";
import { STATUS } from "@/config/track.config";
import { Clock, Inbox, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string | Date;
    link?: string;
    status?: string;
}

export interface GroupedNotification {
    label: string;
    items: NotificationItem[];
}

interface NotifMainProps {
    grouped: GroupedNotification[];
    dismissNotification: (id: string) => void;
}

export function NotifMain({grouped, dismissNotification}: NotifMainProps) {
    const router = useRouter();

    return (
        <>
         {grouped.length > 0 ? (
                    <div className="space-y-10">
                        {grouped.map((group) => (
                            <section key={group.label}>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                                        {group.label}
                                    </span>
                                    <div className="flex-1 h-px bg-neutral-100" />
                                </div>

                                <div className="space-y-4">
                                    {group.items.map((notif) => {
                                        const statusConfig = STATUS[(notif as any).status?.toUpperCase()];
                                        const StatusIcon = statusConfig?.icon || ShoppingBag;
                                        const statusBg = statusConfig?.bgColor || 'bg-orange-500';

                                        return (
                                            <div key={notif.id} className="relative">
                                                <button
                                                    onClick={() => notif.link && router.push(notif.link)}
                                                    className="w-full text-left flex gap-4 p-4 border bg-white border-neutral-200"
                                                >
                                                    <div className={`shrink-0 w-10 h-10 ${statusBg} flex items-center justify-center`}>
                                                        <StatusIcon className="w-5 h-5 text-white" />
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                                                                {notif.type}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-neutral-300 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {getRelativeTime(notif.time)}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-sm font-bold text-neutral-900 leading-tight mb-1">
                                                            {notif.title}
                                                        </h3>
                                                        <p className="text-xs font-medium text-neutral-400 leading-relaxed line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dismissNotification(notif.id);
                                                    }}
                                                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 z-10"
                                                >
                                                    <X className="w-3.5 h-3.5" strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center mb-6">
                            <Inbox className="w-8 h-8 text-neutral-200" />
                        </div>
                        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">All caught up!</h1>
                        <p className="text-sm font-medium text-neutral-400 max-w-xs mt-2">
                            You have no new notifications at the moment.
                        </p>
                    </div>
                )}
        </>
    )
}