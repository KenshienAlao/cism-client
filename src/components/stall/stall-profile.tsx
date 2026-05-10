import { StallItems } from "@/model/stall.model";
import { Calendar, Clock, MessageCircle, ShoppingBag, Star, UserPlus } from "lucide-react";
import { formatTime } from '@/lib/utils/formatTime';
import { formatDate } from '@/lib/utils/formatDate';

interface StallProfileProps {
    stall: StallItems,
    openChat: (stall: { stallId: number; stallName: string; stallImage: string }) => void,
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
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden transition-all hover:shadow-md p-6 md:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
                {/* Avatar */}
                <div className="w-32 h-32 md:w-40 md:h-40 bg-neutral-50 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                    {stall.image ? (
                        <img
                            src={stall.image}
                            alt={stall.name}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-50 rounded-2xl flex items-center justify-center text-4xl font-bold text-neutral-300">
                            {stall.name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-6 md:pt-2 w-full">
                    <div className="space-y-3">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">{stall.name}</h1>
                            {stall.status && (
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full uppercase tracking-widest shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </div>
                            )}
                        </div>
                        <p className="text-base md:text-lg text-neutral-500 max-w-3xl line-clamp-2 leading-relaxed mx-auto md:mx-0">
                            {stall.description || 'Welcome to our market stall.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <button
                            onClick={() => openChat({ stallId: stall.id, stallName: stall.name, stallImage: stall.image || '' })}
                            className="flex items-center gap-2 px-8 py-3.5 bg-white border border-neutral-200 text-neutral-700 text-sm font-bold rounded-2xl hover:bg-neutral-50 hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                            <MessageCircle className="w-4 h-4 text-orange-500" />
                            Chat
                        </button>
                    </div>
                </div>

                {/* Clean Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 w-full md:w-auto md:pl-8 md:border-l border-neutral-100">
                    <div className="space-y-1 bg-neutral-50 rounded-2xl p-4 md:bg-transparent md:p-0 transition-colors hover:bg-neutral-100 md:hover:bg-transparent text-center md:text-left">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                            Ratings
                        </div>
                        <div className="text-xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
                            {stats?.avgRating.toFixed(1)} <span className="text-sm font-medium text-neutral-400 ml-0.5">({stats?.ratingCount})</span>
                        </div>
                    </div>
                    <div className="space-y-1 bg-neutral-50 rounded-2xl p-4 md:bg-transparent md:p-0 transition-colors hover:bg-neutral-100 md:hover:bg-transparent text-center md:text-left">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-orange-500" />
                            Products
                        </div>
                        <div className="text-xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">{stats?.productCount}</div>
                    </div>
                    <div className="space-y-1 bg-neutral-50 rounded-2xl p-4 md:bg-transparent md:p-0 transition-colors hover:bg-neutral-100 md:hover:bg-transparent hidden sm:block text-center md:text-left">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            Joined
                        </div>
                        <div className="text-sm md:text-lg font-bold text-neutral-900 pt-1">{stats?.joined}</div>
                    </div>
                    <div className="space-y-1 bg-neutral-50 rounded-2xl p-4 md:bg-transparent md:p-0 transition-colors hover:bg-neutral-100 md:hover:bg-transparent hidden lg:block text-center md:text-left">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
                            <Clock className="w-4 h-4 text-orange-500" />
                            Hours
                        </div>
                        <div className="text-sm md:text-lg font-bold text-neutral-900 pt-1">{stats?.open} - {stats?.close}</div>
                    </div>
                </div>
            </div>
        </div>

    )
}