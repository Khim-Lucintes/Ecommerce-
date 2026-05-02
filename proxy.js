import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';

// Simple JWT decoder for Edge Runtime (doesn't verify signature, just reads payload)
// API Routes and Server Components will still cryptographically verify it via lib/auth.js
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
        const jsonPayload = decodeURIComponent(atob(paddedBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

// Routes that require login
const PROTECTED = ['/seller', '/admin', '/superadmin', '/cart', '/checkout', '/orders'];

// Routes that require a specific role
const ROLE_ROUTES = {
    '/seller': 'seller',
    '/admin':  'admin',
    '/superadmin': 'superadmin',
};

// Redirect logged-in users away from auth pages
const AUTH_ONLY = ['/login', '/register'];

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? decodeJwtPayload(token) : null;

    // Logged-in users shouldn't visit login/register
    if (AUTH_ONLY.some(p => pathname.startsWith(p)) && payload) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Smart redirect for /dashboard
    if (pathname === '/dashboard') {
        if (payload?.role === 'superadmin') return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
        if (payload?.role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (payload?.role === 'seller') return NextResponse.redirect(new URL('/seller/dashboard', request.url));
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Check protected routes
    const isProtected = PROTECTED.some(p => pathname.startsWith(p));
    if (isProtected && !payload) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-restricted routes
    for (const [route, requiredRole] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(route)) {
            if (requiredRole === 'admin' && (payload?.role === 'admin' || payload?.role === 'superadmin')) {
                continue; // Superadmin can access admin routes
            }
            if (payload?.role !== requiredRole) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard',
        '/seller/:path*',
        '/admin/:path*',
        '/superadmin/:path*',
        '/cart/:path*',
        '/checkout/:path*',
        '/orders/:path*',
        '/login',
        '/register',
    ],
};
