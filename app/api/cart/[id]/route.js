import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { updateCartItem, removeCartItem } from '@/services/cart';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { quantity } = await request.json();
        await updateCartItem(Number(id), Number(quantity));
        return Response.json({ message: 'Cart updated' });
    } catch (err) {
        console.error('[PUT /api/cart/[id]]', err);
        return Response.json({ error: 'Failed to update cart' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        await removeCartItem(Number(id));
        return Response.json({ message: 'Item removed' });
    } catch (err) {
        console.error('[DELETE /api/cart/[id]]', err);
        return Response.json({ error: 'Failed to remove item' }, { status: 500 });
    }
}
