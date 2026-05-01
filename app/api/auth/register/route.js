import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken, buildSessionCookie } from '@/lib/auth';

export async function POST(request) {
    try {
        const { full_name, email, username, password, phone } = await request.json();

        // ── Validate ──────────────────────────────────────────────────────
        if (!full_name?.trim()) return Response.json({ error: 'Full name is required' }, { status: 400 });
        if (!email?.trim())     return Response.json({ error: 'Email is required' }, { status: 400 });
        if (!password)          return Response.json({ error: 'Password is required' }, { status: 400 });
        if (password.length < 6) return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

        // ── Check duplicate email ─────────────────────────────────────────
        const [existing] = await pool.query(
            'SELECT profile_id FROM profile_table WHERE email = ?',
            [email.trim().toLowerCase()]
        );
        if (existing.length > 0) {
            return Response.json({ error: 'Email already registered' }, { status: 409 });
        }

        // ── Get customer role_id ──────────────────────────────────────────
        const [roles] = await pool.query(
            "SELECT role_id FROM role_table WHERE role_name = 'customer' LIMIT 1"
        );
        if (roles.length === 0) {
            return Response.json({ error: 'Role configuration missing. Run seed script.' }, { status: 500 });
        }
        const role_id = roles[0].role_id;

        // ── Hash password & insert ────────────────────────────────────────
        const password_hash = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            `INSERT INTO profile_table (role_id, full_name, email, username, password_hash, phone)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                role_id,
                full_name.trim(),
                email.trim().toLowerCase(),
                username?.trim() || null,
                password_hash,
                phone?.trim() || null,
            ]
        );

        // ── Sign JWT and set session cookie ───────────────────────────────
        const token = signToken({
            id:    result.insertId,
            email: email.trim().toLowerCase(),
            role:  'customer',
        });

        return new Response(
            JSON.stringify({ message: 'Registration successful' }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': buildSessionCookie(token),
                },
            }
        );

    } catch (err) {
        console.error('[POST /api/auth/register]', err);
        return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
