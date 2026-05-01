import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getStoreByOwner, createStore } from '@/services/stores';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        const store = await getStoreByOwner(payload.id);
        return Response.json({ store });
    } catch (err) {
        console.error('[GET /api/stores/mine]', err);
        return Response.json({ error: 'Failed to fetch store' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        const { store_name, description } = await request.json();
        if (!store_name) return Response.json({ error: 'Store name is required' }, { status: 400 });

        const existing = await getStoreByOwner(payload.id);
        if (existing) return Response.json({ error: 'You already have a store' }, { status: 409 });

        const store_id = await createStore(payload.id, store_name, description);
        return Response.json({ message: 'Store created', store_id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/stores/mine]', err);
        return Response.json({ error: 'Failed to create store' }, { status: 500 });
    }
}
