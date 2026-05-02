import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { deleteAddress } from '@/services/addresses';

export async function DELETE(request, { params }) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { id } = await params;
        const deleted = await deleteAddress(Number(id), payload.id);
        if (!deleted) return Response.json({ error: 'Address not found' }, { status: 404 });

        return Response.json({ message: 'Address deleted' });
    } catch (err) {
        console.error('[DELETE /api/addresses/[id]]', err);
        return Response.json({ error: 'Failed to delete address' }, { status: 500 });
    }
}
