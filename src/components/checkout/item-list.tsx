import { Store } from 'lucide-react';
import Image from 'next/image';
import { StalledCart } from '@/hooks/use-cart';

export function CheckoutItemList({ groups }: { groups: StalledCart[] }) {
    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.stallName} className="space-y-4">
                    {/* Stall header */}
                    <div className="flex items-center gap-2">
                        <Store className="w-3 h-3 text-orange-500 shrink-0" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                            {group.stallName}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {group.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 md:gap-4">
                                <div className="relative w-12 h-12 md:w-14 md:h-14 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 48px, 56px"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs md:text-sm font-black text-neutral-900 truncate uppercase tracking-tight">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            ×{item.quantity}
                                        </span>
                                        <span className="w-px h-3 bg-neutral-200" />
                                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                                            ₱{item.price.toLocaleString()} ea.
                                        </span>
                                    </div>
                                </div>
                                <span className="text-sm md:text-base font-black text-neutral-900 shrink-0 tracking-tight">
                                    ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
