import { getProducts, createProduct } from '@/services/products';
import { getCategories } from '@/services/categories';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

// GET /api/products?category_id=&store_id=&limit=&offset=
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const opts = {
            category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
            store_id: searchParams.get('store_id') ? Number(searchParams.get('store_id')) : undefined,
            limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
            offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
            sort_by: searchParams.get('sort_by') || 'latest',
        };
        const products = await getProducts(opts);
        return Response.json({ products });
    } catch (err) {
        console.error('[GET /api/products]', err);
        return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products  (seller only)
export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload || payload.role !== 'seller') {
            return Response.json({ error: 'Seller access required' }, { status: 403 });
        }

        const { product_name, description, price, stock, image_url, category_id } = await request.json();

        if (!product_name?.trim()) return Response.json({ error: 'Product name is required' }, { status: 400 });
        if (!price || isNaN(price)) return Response.json({ error: 'Valid price is required' }, { status: 400 });
        if (!category_id) return Response.json({ error: 'Category is required' }, { status: 400 });

        // Get seller's store
        const [stores] = await pool.query(
            'SELECT store_id FROM store_table WHERE owner_id = ? LIMIT 1',
            [payload.id]
        );
        if (stores.length === 0) {
            return Response.json({ error: 'You must create a store first' }, { status: 400 });
        }

        // createProduct handles the transaction:
        //   INSERT product_table → INSERT product_variant_table → INSERT product_image_table
        const product_id = await createProduct({
            store_id: stores[0].store_id,
            category_id,
            product_name: product_name.trim(),
            description: description ?? null,
            price,
            stock: stock ?? 0,
            image_url: image_url ?? null,   // Cloudinary URL lands in product_image_table
        });

        return Response.json({ message: 'Product created', product_id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/products]', err);
        return Response.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// GET /api/categories (convenience — bundled in this file)
export { getCategories };
