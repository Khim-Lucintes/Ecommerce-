import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, buildSessionCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // ── Validate ──────────────────────────────────────────────────────
        if (!email?.trim())  return Response.json({ error: 'Email is required' }, { status: 400 });
        if (!password)       return Response.json({ error: 'Password is required' }, { status: 400 });

        // ── Look up user ──────────────────────────────────────────────────
        const [rows] = await pool.query(
            `SELECT p.profile_id, p.full_name, p.email, p.password_hash, r.role_name
             FROM profile_table p
             JOIN role_table r ON p.role_id = r.role_id
             WHERE p.email = ?
             LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        if (rows.length === 0) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = rows[0];

        // ── Verify password ───────────────────────────────────────────────
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // ── Sign JWT and set session cookie ───────────────────────────────
        const token = signToken({
            id:    user.profile_id,
            email: user.email,
            role:  user.role_name,
        });

        return new Response(
            JSON.stringify({
                message: 'Login successful',
                user: { id: user.profile_id, name: user.full_name, email: user.email, role: user.role_name },
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': buildSessionCookie(token),
                },
            }
        );

    } catch (err) {
        console.error('[POST /api/auth/login]', err);
        return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }
}
