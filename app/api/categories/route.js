import { getCategories } from '@/services/categories';

export async function GET() {
    try {
        const categories = await getCategories();
        return Response.json({ categories });
    } catch (err) {
        console.error('[GET /api/categories]', err);
        return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
