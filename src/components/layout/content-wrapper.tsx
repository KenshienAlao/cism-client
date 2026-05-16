'use client';

import { usePathname } from 'next/navigation';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideOnRoutes = ['/login', '/register'];
    const isHidden = hideOnRoutes.includes(pathname);

    return (
        <div className={`flex-1 transition-all duration-300 ${isHidden ? '' : 'pb-24 md:pb-36'}`}>
            {children}
        </div>
    );
}
