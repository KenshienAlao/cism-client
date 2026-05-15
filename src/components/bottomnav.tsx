'use client';

import { Home, ClipboardList, ShoppingCart, User, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useOrder } from '@/hooks/use-order';
import { useNotifications } from '@/hooks/use-notifications';
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/service/order.service';
import { cartService } from '@/service/cart.service';
import { authService } from '@/service/auth.service';
import { authKeys } from '@/hooks/use-auth';
import { MY_ORDERS_QUERY_KEY } from '@/hooks/use-order';

export function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { useMyOrders } = useOrder();
    const { count: notifCount } = useNotifications();
    const queryClient = useQueryClient();

    const { data: orders } = useMyOrders({
        refetchInterval: 30000
    });

    const handlePrefetch = (href: string) => {
        switch (href) {
            case '/':
            case '/account':
                queryClient.prefetchQuery({
                    queryKey: authKeys.profile(),
                    queryFn: () => authService.validateCookie().then(res => res.data),
                });
                break;
            case '/orders':
                queryClient.prefetchQuery({
                    queryKey: MY_ORDERS_QUERY_KEY,
                    queryFn: () => orderService.getMyOrders().then(res => res.data),
                });
                break;
            case '/cart':
                queryClient.prefetchQuery({
                    queryKey: ['cart'],
                    queryFn: () => cartService.getCart().then(res => res.data),
                });
                break;
            case '/notifications':
                // Notifications are derived from orders, so prefetch orders
                queryClient.prefetchQuery({
                    queryKey: MY_ORDERS_QUERY_KEY,
                    queryFn: () => orderService.getMyOrders().then(res => res.data),
                });
                break;
        }
    };

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
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-100 pb-safe">
            <nav className="max-w-md mx-auto h-16 md:h-18 flex items-center justify-around px-2">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    const count = item.isCart ? cartCount : item.isOrders ? activeOrdersCount : item.isActivity ? notifCount : 0;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onMouseEnter={() => handlePrefetch(item.href)}
                            className="flex-1 h-full flex flex-col items-center justify-center gap-1 group active:opacity-70 transition-opacity"
                        >
                            <div className="relative">
                                <Icon 
                                    className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-neutral-400'}`} 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                />
                                {count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white border-2 border-white">
                                        {count}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'text-orange-500' : 'text-neutral-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
