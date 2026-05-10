import { Store } from 'lucide-react';
import Image from 'next/image';
import { StalledCart } from '@/hooks/use-cart';

export function CheckoutItemList({ groups }: { groups: StalledCart[] }) {
    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <div key={group.stallName} className="space-y-4">
                    {/* Stall Identification */}
                    <div className="flex items-center gap-2 px-1">
                        <Store className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">{group.stallName}</span>
                    </div>

                    {/* Items Manifest */}
                    <div className="space-y-4">
                        {group.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 group">
                                <div className="relative w-12 h-12 md:w-16 md:h-16 bg-neutral-100 shrink-0 border border-neutral-100">
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover grayscale-[0.2] contrast-[1.1]"
                                            sizes="(max-width: 768px) 48px, 64px"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="text-sm md:text-base font-black text-neutral-900 tracking-tight truncate uppercase">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                            Quantity: {item.quantity}
                                        </span>
                                        <div className="w-1 h-1 bg-neutral-200 rounded-full" />
                                        <span className="text-[10px] md:text-xs font-bold text-neutral-300 uppercase tracking-widest">
                                            ₱{item.price.toLocaleString()} unit
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-sm md:text-lg font-black text-neutral-900 tracking-tighter">
                                        ₱{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
