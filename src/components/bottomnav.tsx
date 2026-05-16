'use client';

import { Home, ClipboardList, ShoppingCart, User, Bell, Menu } from 'lucide-react';
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
        <>
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
                <nav className="h-14 flex items-center justify-around px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        const count = item.isCart ? cartCount : item.isOrders ? activeOrdersCount : item.isActivity ? notifCount : 0;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => handlePrefetch(item.href)}
                                className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                    isActive ? 'text-orange-500' : 'text-foreground hover:bg-accent'
                                }`}
                            >
                                <div className="relative p-1">
                                    <Icon className="w-5 h-5" strokeWidth={2} />
                                    {count > 0 && (
                                        <span className="absolute top-0 right-0 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-md bg-orange-500 text-[8px] font-medium text-white border border-background">
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop Side Navigation */}
            <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 z-50 flex-col bg-background border-r border-border p-4 gap-4">
                {/* Header section */}
                <div className="flex items-center h-10 px-3">
                    <button 
                        type="button"
                        className="p-1.5 rounded-md text-foreground hover:bg-accent transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <Menu className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        const count = item.isCart ? cartCount : item.isOrders ? activeOrdersCount : item.isActivity ? notifCount : 0;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => handlePrefetch(item.href)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-accent text-orange-500 font-medium' 
                                        : 'text-foreground hover:bg-accent'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-foreground'}`} strokeWidth={2} />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                {count > 0 && (
                                    <span className={`flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-md text-xs font-medium ${
                                        isActive ? 'bg-orange-500 text-white' : 'bg-input text-foreground'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}