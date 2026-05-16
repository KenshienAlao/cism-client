'use client';

import { Home, ClipboardList, ShoppingCart, User, Bell, Menu, X } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/sidebar.context';

export function BottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const { useMyOrders } = useOrder();
    const { count: notifCount } = useNotifications();
    const queryClient = useQueryClient();
    const { isCollapsed, toggleSidebar } = useSidebar();

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

    const sidebarVariants = {
        expanded: {
            width: 256,
            transition: { duration: 0.3, ease: 'easeInOut' as const }
        },
        collapsed: {
            width: 72,
            transition: { duration: 0.3, ease: 'easeInOut' as const }
        }
    };

    const labelVariants = {
        expanded: {
            opacity: 1,
            width: 'auto',
            x: 0,
            transition: { duration: 0.2, delay: 0.1 }
        },
        collapsed: {
            opacity: 0,
            width: 0,
            x: -8,
            transition: { duration: 0.15 }
        }
    };

    const badgeVariants = {
        expanded: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.2, delay: 0.15 }
        },
        collapsed: {
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.1 }
        }
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border pb-safe">
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
                                    isActive ? 'text-orange-500' : 'text-muted-foreground'
                                }`}
                            >
                                <div className="relative p-1">
                                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                                    {count > 0 && (
                                        <span className="absolute top-0 right-0 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white border border-background">
                                            {count > 9 ? '9+' : count}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[9px] font-semibold uppercase tracking-wider transition-colors ${isActive ? 'text-orange-500' : 'text-muted-foreground'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                animate={isCollapsed ? 'collapsed' : 'expanded'}
                initial={false}
                className="hidden md:flex fixed top-0 left-0 bottom-0 z-50 flex-col bg-background border-r border-border overflow-hidden"
            >
                {/* Sidebar Header */}
                <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
                    <motion.button
                        onClick={toggleSidebar}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isCollapsed ? (
                                <motion.span
                                    key="menu"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="w-5 h-5" strokeWidth={2} />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="close"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-5 h-5" strokeWidth={2} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        const count = item.isCart ? cartCount : item.isOrders ? activeOrdersCount : item.isActivity ? notifCount : 0;

                        return (
                            <motion.div
                                key={item.label}
                                initial={false}
                                className="relative group"
                            >
                                <Link
                                    href={item.href}
                                    onMouseEnter={() => handlePrefetch(item.href)}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors relative ${
                                        isActive
                                            ? 'bg-orange-500/10 text-orange-500'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-sidebar-pill"
                                            className="absolute inset-0 bg-orange-500/10 rounded-lg"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                        />
                                    )}

                                    {/* Icon with badge */}
                                    <div className="relative shrink-0 z-10">
                                        <Icon
                                            className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-500' : ''}`}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        {count > 0 && (
                                            <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-0.5 items-center justify-center rounded-full text-[9px] font-bold border border-background ${
                                                isActive ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'
                                            }`}>
                                                {count > 9 ? '9+' : count}
                                            </span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <motion.span
                                        variants={labelVariants}
                                        animate={isCollapsed ? 'collapsed' : 'expanded'}
                                        initial={false}
                                        className={`text-sm font-medium whitespace-nowrap overflow-hidden z-10 ${isActive ? 'text-orange-500' : ''}`}
                                    >
                                        {item.label}
                                    </motion.span>

                                    {/* Badge in expanded mode */}
                                    {count > 0 && (
                                        <motion.span
                                            variants={badgeVariants}
                                            animate={isCollapsed ? 'collapsed' : 'expanded'}
                                            initial={false}
                                            className={`ml-auto flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full text-[10px] font-bold z-10 ${
                                                isActive ? 'bg-orange-500 text-white' : 'bg-secondary text-foreground'
                                            }`}
                                        >
                                            {count > 9 ? '9+' : count}
                                        </motion.span>
                                    )}
                                </Link>

                                {/* Tooltip when collapsed */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none z-200">
                                        <motion.div
                                            initial={{ opacity: 0, x: -6 }}
                                            whileHover={{ opacity: 1, x: 0 }}
                                            className="hidden group-hover:flex items-center gap-2 bg-foreground text-background text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap"
                                        >
                                            {item.label}
                                            {count > 0 && (
                                                <span className="bg-orange-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                                                    {count}
                                                </span>
                                            )}
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </nav>
            </motion.aside>
        </>
    );
}