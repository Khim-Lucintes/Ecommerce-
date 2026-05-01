import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/services/wishlist';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const items = await getWishlist(payload.id);
        return Response.json({ items });
    } catch (err) {
        console.error('[GET /api/wishlist]', err);
        return Response.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { product_id } = await request.json();
        const result = await addToWishlist(payload.id, Number(product_id));
        return Response.json(result, { status: result.added ? 201 : 200 });
    } catch (err) {
        console.error('[POST /api/wishlist]', err);
        return Response.json({ error: 'Failed to update wishlist' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { product_id } = await request.json();
        await removeFromWishlist(payload.id, Number(product_id));
        return Response.json({ message: 'Removed from wishlist' });
    } catch (err) {
        console.error('[DELETE /api/wishlist]', err);
        return Response.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
