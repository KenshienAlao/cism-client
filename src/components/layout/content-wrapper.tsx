'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/sidebar.context';
import { useEffect, useState } from 'react';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isCollapsed } = useSidebar();

    const hideOnRoutes = ['/login', '/register'];
    const isHidden = hideOnRoutes.includes(pathname);

    return (
        <div
            className={`flex-1 transition-[padding] duration-300 ease-in-out pb-20 md:pb-10 ${
                isHidden ? '' : isCollapsed ? 'md:pl-[72px]' : 'md:pl-[256px]'
            }`}
        >
            {children}
        </div>
    );
}
