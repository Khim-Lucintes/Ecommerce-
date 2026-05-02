import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { updateUserRole } from '@/services/admin';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { role_id } = await request.json();
        if (!role_id) return Response.json({ error: 'role_id is required' }, { status: 400 });

        // Prevent self-demotion
        if (payload.id === Number(id)) {
            return Response.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        await updateUserRole(Number(id), Number(role_id));
        return Response.json({ message: 'User role updated successfully' });
    } catch (err) {
        console.error('[PUT /api/admin/users/[id]/role]', err);
        return Response.json({ error: 'Failed to update user role' }, { status: 500 });
    }
}
