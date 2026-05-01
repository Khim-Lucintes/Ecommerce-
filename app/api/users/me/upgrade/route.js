import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken, signToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Get the seller role ID (assuming 2 is seller from setup_db.js)
        const [roles] = await pool.query('SELECT role_id FROM role_table WHERE role_name = "seller"');
        if (roles.length === 0) {
            return NextResponse.json({ error: 'Seller role not found' }, { status: 500 });
        }
        const sellerRoleId = roles[0].role_id;

        // Update user's role
        await pool.query('UPDATE profile_table SET role_id = ? WHERE profile_id = ?', [sellerRoleId, payload.id]);

        // Create a new token with the updated role
        const newToken = signToken({
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: 'seller'
        });

        // Set the new cookie
        const response = NextResponse.json({ success: true, message: 'Upgraded to seller' });
        response.cookies.set({
            name: COOKIE_NAME,
            value: newToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;

    } catch (error) {
        console.error('Upgrade Error:', error);
        return NextResponse.json({ error: 'Failed to upgrade account' }, { status: 500 });
    }
}
