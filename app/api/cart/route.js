import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getCartItems, addToCart } from '@/services/cart';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const items = await getCartItems(payload.id);
        const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

        return Response.json({ items, total: total.toFixed(2) });
    } catch (err) {
        console.error('[GET /api/cart]', err);
        return Response.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { product_id, quantity } = await request.json();
        if (!product_id || !quantity) return Response.json({ error: 'Missing product or quantity' }, { status: 400 });

        await addToCart(payload.id, Number(product_id), Number(quantity));
        return Response.json({ message: 'Added to cart' }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/cart]', err);
        return Response.json({ error: 'Failed to add to cart' }, { status: 500 });
    }
}
