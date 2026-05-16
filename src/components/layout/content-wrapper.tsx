'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/sidebar.context';
import { useEffect, useState } from 'react';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isCollapsed } = useSidebar();
    const [mounted, setMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const hideOnRoutes = ['/login', '/register'];
    const isHidden = hideOnRoutes.includes(pathname);

    const sidebarOffset = isCollapsed ? 72 : 256;

    return (
        <div
            className="flex-1 transition-[padding] duration-300 ease-in-out pb-20 md:pb-10"
            style={(mounted && isDesktop && !isHidden) ? { paddingLeft: sidebarOffset } : undefined}
        >
            {children}
        </div>
    );
}
