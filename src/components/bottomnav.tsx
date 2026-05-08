'use client';

import { Home, ClipboardList, ShoppingCart, User, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useOrder } from '@/hooks/use-order';
import { useNotifications } from '@/hooks/use-notifications';
import { useMemo } from 'react';

export function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { useMyOrders } = useOrder();
    const { count: notifCount } = useNotifications();

    const { data: orders } = useMyOrders({
        refetchInterval: 30000
    });

    const activeOrdersCount = useMemo(() => {
        if (!orders) return 0;
        return orders.filter(order =>
            ['PENDING', 'PREPARING', 'READY'].includes(order.status.toUpperCase())
        ).length;
    }, [orders]);

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: ClipboardList, label: 'Orders', href: '/orders', isOrders: true },
        { icon: ShoppingCart, label: 'Cart', href: '/cart', isCart: true },
        { icon: Bell, label: 'Activity', href: '/notifications', isActivity: true },
        { icon: User, label: 'Me', href: '/account' },
    ];


    const hideOnRoutes = ['/login', '/register'];
    if (hideOnRoutes.includes(pathname)) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-4 pointer-events-none">
            <nav className="max-w-md mx-auto bg-white/90 backdrop-blur-2xl border border-black/5 rounded-[2rem] pointer-events-auto overflow-hidden">
                <div className="flex items-center justify-around h-20 px-2">
                    {navItems.map((item: any) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        const content = (
                            <div className="flex flex-col items-center justify-center gap-1.5 h-full w-full relative transition-all duration-300">
                                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-neutral-400 hover:text-neutral-600'}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'animate-in zoom-in-75 duration-300' : ''}`} strokeWidth={2.5} />
                                    {((item.isCart && cartCount > 0) || (item.isOrders && activeOrdersCount > 0) || (item.isActivity && notifCount > 0)) && (
                                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white z-10">
                                            {item.isCart ? cartCount : item.isOrders ? activeOrdersCount : notifCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${isActive ? 'text-orange-500' : 'text-neutral-400'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full animate-in fade-in duration-500" />
                                )}
                            </div>
                        );

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex-1 h-full active:scale-90 transition-transform"
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
