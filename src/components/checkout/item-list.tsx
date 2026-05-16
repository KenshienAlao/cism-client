import { Store } from 'lucide-react';
import Image from 'next/image';
import { StalledCart } from '@/hooks/use-cart';

export function CheckoutItemList({ groups }: { groups: StalledCart[] }) {
    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <div key={group.stallName} className="space-y-2.5">
                    {/* Stall header */}
                    <div className="flex items-center gap-1.5 px-0.5">
                        <Store className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span className="text-xs font-medium text-muted-foreground">
                            {group.stallName}
                        </span>
                    </div>

                    {/* Items Stack */}
                    <div className="space-y-2">
                        {group.items.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex items-center gap-3 p-2 rounded-lg border border-border bg-secondary/30"
                            >
                                {/* Thumbnail Container */}
                                <div className="relative w-12 h-12 bg-input shrink-0 rounded-md border border-border overflow-hidden flex items-center justify-center">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover mix-blend-multiply dark:mix-blend-normal"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest text-center leading-tight">
                                            No<br/>Image
                                        </span>
                                    )}
                                </div>

                                {/* Breakdown */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground truncate">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                        <span className="font-medium">
                                            qty: {item.quantity}
                                        </span>
                                        <span className="w-px h-2.5 bg-border" />
                                        <span>
                                            ₱{item.price.toLocaleString()} ea.
                                        </span>
                                    </div>
                                </div>

                                {/* Summation Output */}
                                <span className="text-sm font-medium text-foreground shrink-0 tab-nums">
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