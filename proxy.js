import { NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

// Routes that require login
const PROTECTED = ['/seller', '/admin', '/cart', '/checkout', '/orders'];

// Routes that require a specific role
const ROLE_ROUTES = {
    '/seller': 'seller',
    '/admin':  'admin',
};

// Redirect logged-in users away from auth pages
const AUTH_ONLY = ['/login', '/register'];

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token ? verifyToken(token) : null;

    // Logged-in users shouldn't visit login/register
    if (AUTH_ONLY.some(p => pathname.startsWith(p)) && payload) {
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
        if (pathname.startsWith(route) && payload?.role !== requiredRole) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/seller/:path*',
        '/admin/:path*',
        '/cart/:path*',
        '/checkout/:path*',
        '/orders/:path*',
        '/login',
        '/register',
    ],
};
