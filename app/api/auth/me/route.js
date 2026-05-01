import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) {
            return Response.json({ user: null }, { status: 200 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return Response.json({ user: null }, { status: 200 });
        }

        // Fetch fresh user data from DB
        const [rows] = await pool.query(
            `SELECT p.profile_id, p.full_name, p.email, p.username, p.phone, r.role_name
             FROM profile_table p
             JOIN role_table r ON p.role_id = r.role_id
             WHERE p.profile_id = ?
             LIMIT 1`,
            [payload.id]
        );

        if (rows.length === 0) {
            return Response.json({ user: null }, { status: 200 });
        }

        const u = rows[0];
        return Response.json({
            user: {
                id:       u.profile_id,
                name:     u.full_name,
                email:    u.email,
                username: u.username,
                phone:    u.phone,
                role:     u.role_name,
            },
        });

    } catch (err) {
        console.error('[GET /api/auth/me]', err);
        return Response.json({ user: null }, { status: 200 });
    }
}
