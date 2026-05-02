import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';
import { getCartCount } from '@/services/cart';
import { getUnreadMessageCount } from '@/services/chat';
import NavbarActions from './NavbarActions';
import { Input } from '@/components/ui/input';

async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload) return null;

        const [rows] = await pool.query(
            `SELECT p.profile_id, p.full_name, r.role_name
             FROM profile_table p
             JOIN role_table r ON p.role_id = r.role_id
             WHERE p.profile_id = ? LIMIT 1`,
            [payload.id]
        );
        if (!rows[0]) return null;
        return { id: rows[0].profile_id, name: rows[0].full_name, role: rows[0].role_name };
    } catch {
        return null;
    }
}

export default async function Navbar() {
    const user = await getCurrentUser();
    const cartCount = user ? await getCartCount(user.id) : 0;
    const unreadMessages = user ? await getUnreadMessageCount(user.id) : 0;

    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-indigo-600">Lazapee</span>
                </Link>

                {/* Search */}
                <form action="/products" method="GET" className="hidden sm:flex flex-1 max-w-sm mx-6">
                    <div className="relative w-full">
                        <Input
                            name="q"
                            type="text"
                            placeholder="Search products…"
                            className="w-full pr-10"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* Auth actions — client component for interactivity */}
                <NavbarActions user={user} cartCount={cartCount} unreadMessages={unreadMessages} />
            </div>
        </header>
    );
}
