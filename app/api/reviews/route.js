import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { submitReview, getReviewsByProduct } from '@/services/reviews';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const product_id = searchParams.get('product_id');
        if (!product_id) return Response.json({ error: 'product_id is required' }, { status: 400 });

        const reviews = await getReviewsByProduct(Number(product_id));
        return Response.json({ reviews });
    } catch (err) {
        console.error('[GET /api/reviews]', err);
        return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });
        if (payload.role === 'seller' || payload.role === 'admin') {
            return Response.json({ error: 'Only customers can submit reviews' }, { status: 403 });
        }

        const { product_id, rating, comment } = await request.json();
        if (!product_id) return Response.json({ error: 'product_id is required' }, { status: 400 });

        await submitReview({ profile_id: payload.id, product_id, rating, comment });
        return Response.json({ message: 'Review submitted' }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/reviews]', err);
        const status = err.message.includes('already reviewed') ? 409 : 400;
        return Response.json({ error: err.message || 'Failed to submit review' }, { status });
    }
}
