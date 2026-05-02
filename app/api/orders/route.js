import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { createOrder, getOrdersByBuyer } from '@/services/orders';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const orders = await getOrdersByBuyer(payload.id);
        return Response.json({ orders });
    } catch (err) {
        console.error('[GET /api/orders]', err);
        return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        // address_id is optional — orders can still be placed without one
        let address_id = null;
        try {
            const body = await request.json();
            address_id = body?.address_id || null;
        } catch {
            // no body / not JSON — fine, proceed without address
        }

        const order_id = await createOrder(payload.id, address_id);
        return Response.json({ message: 'Order placed', order_id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/orders]', err);
        return Response.json({ error: err.message || 'Checkout failed' }, { status: 400 });
    }
}
