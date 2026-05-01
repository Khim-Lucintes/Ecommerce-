'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalLayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (isAuthPage) {
        return null;
    }

    return <>{children}</>;
}
