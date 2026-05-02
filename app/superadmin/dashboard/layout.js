import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SuperadminLayout({ children }) {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

    if (!payload || payload.role !== 'superadmin') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex">
                <aside className="hidden lg:flex w-56 min-h-screen flex-col border-r border-gray-100 bg-white px-4 py-6 gap-1 shrink-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-3">Superadmin Panel</p>
                    <a href="/superadmin/dashboard"
                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        📊 Overview
                    </a>
                    <a href="/superadmin/dashboard#users"
                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        👥 Users
                    </a>
                    <a href="/superadmin/dashboard#products"
                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        📦 Products
                    </a>
                    <a href="/superadmin/dashboard#orders"
                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        🛒 Orders
                    </a>
                    <a href="/"
                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
                        🛍️ View Shop
                    </a>
                </aside>
                <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
