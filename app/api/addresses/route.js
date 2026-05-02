import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getAddressesByUser, addAddress } from '@/services/addresses';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const addresses = await getAddressesByUser(payload.id);
        return Response.json({ addresses });
    } catch (err) {
        console.error('[GET /api/addresses]', err);
        return Response.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const body = await request.json();
        const { full_address, city, postal_code } = body;

        if (!full_address?.trim()) {
            return Response.json({ error: 'Full address is required' }, { status: 400 });
        }

        const address_id = await addAddress(payload.id, { full_address, city, postal_code });
        return Response.json({ message: 'Address saved', address_id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/addresses]', err);
        return Response.json({ error: 'Failed to save address' }, { status: 500 });
    }
}
