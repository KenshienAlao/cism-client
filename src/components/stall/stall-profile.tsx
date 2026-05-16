import { StallItems } from "@/model/stall.model";
import { Calendar, Clock, ShoppingBag, Star, MessageCircle } from "lucide-react";
import { formatTime } from '@/lib/utils/formatTime';
import { formatDate } from '@/lib/utils/formatDate';
import Image from 'next/image';

interface StallProfileProps {
    stall: StallItems;
    openChat: (stall: { stallId: number; stallName: string; stallImage: string }) => void;
}

export function StallProfile({ stall, openChat }: StallProfileProps) {
    const ratingCount = stall.reviews?.length || 0;
    const avgRating = ratingCount > 0
        ? stall.reviews.reduce((acc, r) => acc + r.star, 0) / ratingCount
        : 0;

    const stats = {
        avgRating,
        ratingCount,
        productCount: stall.items?.length || 0,
        joined: formatDate(stall.createdAt),
        open: formatTime(stall.openAt),
        close: formatTime(stall.closeAt)
    };

    return (
        <div className="bg-card text-card-foreground p-4 md:p-5 flex flex-col md:flex-row gap-4 items-center md:items-start text-center md:text-left w-full">
            {/* Avatar container */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 bg-input border border-border rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                {stall.image ? (
                    <Image
                        src={stall.image}
                        alt={stall.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 112px"
                    />
                ) : (
                    <span className="text-xl font-bold text-foreground/40">
                        {stall.name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-1.5 md:gap-3">
                    <h1 className="text-base font-bold text-foreground tracking-tight truncate max-w-full">
                        {stall.name}
                    </h1>
                    {stall.status && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary text-foreground text-xs font-medium rounded-md tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-md bg-orange-500" />
                            Active
                        </div>
                    )}
                </div>

                <p className="text-sm text-foreground/70 line-clamp-2 max-w-2xl">
                    {stall.description || 'Welcome to our market stall.'}
                </p>

                <div className="flex justify-center md:justify-start">
                    <button
                        onClick={() => openChat({ stallId: stall.id, stallName: stall.name, stallImage: stall.image || '' })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-input border border-border text-sm font-medium rounded-md hover:text-orange-500 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                    >
                        <MessageCircle className="w-4 h-4 text-orange-500" />
                        <span>Chat</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto pt-3 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-border">
                <div className="bg-secondary p-4 rounded-md text-center md:text-left min-w-[110px]">
                    <div className="text-xs font-medium text-foreground/60 flex items-center justify-center md:justify-start gap-1.5 mb-1">
                        <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span>Ratings</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                        {stats.avgRating.toFixed(1)}{' '}
                        <span className="text-xs font-normal text-foreground/50">({stats.ratingCount})</span>
                    </div>
                </div>

                <div className="bg-secondary p-4 rounded-md text-center md:text-left min-w-[110px]">
                    <div className="text-xs font-medium text-foreground/60 flex items-center justify-center md:justify-start gap-1.5 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                        <span>Products</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">{stats.productCount}</div>
                </div>

                <div className="bg-secondary p-4 rounded-md text-center md:text-left min-w-[110px] hidden sm:block">
                    <div className="text-xs font-medium text-foreground/60 flex items-center justify-center md:justify-start gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        <span>Joined</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">{stats.joined}</div>
                </div>

                <div className="bg-secondary p-4 rounded-md text-center md:text-left min-w-[110px] hidden lg:block">
                    <div className="text-xs font-medium text-foreground/60 flex items-center justify-center md:justify-start gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>Hours</span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">
                        {stats.open} - {stats.close}
                    </div>
                </div>
            </div>
        </div>
    );
}