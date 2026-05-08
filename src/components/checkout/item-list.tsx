import { Store } from 'lucide-react';
import Image from 'next/image';
import { StalledCart } from '@/hooks/use-cart';

export function CheckoutItemList({ groups }: { groups: StalledCart[] }) {
    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <div key={group.stallName} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Store className="w-3 h-3 text-orange-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{group.stallName}</span>
                    </div>
                    {group.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-neutral-900 truncate">{item.name}</h4>
                                <span className="text-[10px] text-neutral-400">×{item.quantity}</span>
                            </div>
                            <span className="text-xs font-black text-neutral-900">₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
