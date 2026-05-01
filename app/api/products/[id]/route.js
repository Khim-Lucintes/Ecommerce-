import { getProductById, updateProduct, deleteProduct } from '@/services/products';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

// GET /api/products/[id]
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const product = await getProductById(Number(id));
        if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
        return Response.json({ product });
    } catch (err) {
        console.error('[GET /api/products/[id]]', err);
        return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

// PUT /api/products/[id]  (seller who owns the product)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        // Verify ownership via store
        const [rows] = await pool.query(
            `SELECT p.product_id FROM product_table p
             JOIN store_table s ON p.store_id = s.store_id
             WHERE p.product_id = ? AND s.owner_id = ?`,
            [id, payload.id]
        );
        if (rows.length === 0) {
            return Response.json({ error: 'Product not found or not yours' }, { status: 404 });
        }

        const body = await request.json();
        if (!body.product_name?.trim()) return Response.json({ error: 'Product name is required' }, { status: 400 });
        if (!body.price || isNaN(body.price)) return Response.json({ error: 'Valid price is required' }, { status: 400 });

        await updateProduct(Number(id), body);
        return Response.json({ message: 'Product updated' });
    } catch (err) {
        console.error('[PUT /api/products/[id]]', err);
        return Response.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE /api/products/[id]  (seller who owns the product)
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        const [rows] = await pool.query(
            `SELECT p.product_id FROM product_table p
             JOIN store_table s ON p.store_id = s.store_id
             WHERE p.product_id = ? AND s.owner_id = ?`,
            [id, payload.id]
        );
        if (rows.length === 0) {
            return Response.json({ error: 'Product not found or not yours' }, { status: 404 });
        }

        await deleteProduct(Number(id));
        return Response.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('[DELETE /api/products/[id]]', err);
        return Response.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
