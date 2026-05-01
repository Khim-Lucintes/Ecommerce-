'use client';

import { useRouter } from 'next/navigation';

export default function NavbarActions({ user }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <a href="/login"
                   className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                    Sign in
                </a>
                <a href="/register"
                   className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                    Register
                </a>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {user.role === 'seller' && (
                <a href="/seller/dashboard"
                   className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                    My Store
                </a>
            )}
            {user.role === 'admin' && (
                <a href="/admin/dashboard"
                   className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                    Admin
                </a>
            )}
            <a href="/cart"
               className="relative text-gray-600 hover:text-gray-900 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </a>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[120px]">{user.name}</span>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
