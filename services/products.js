import pool from '@/lib/db';

/**
 * Get all products with store, category, first variant (price/stock), and first image.
 */
export async function getProducts({ limit = 20, offset = 0, category_id, store_id, sort_by = 'latest', q } = {}) {
    let sql = `
        SELECT
            p.product_id, p.product_name, p.description, p.created_at,
            s.store_id, s.store_name,
            c.category_id, c.category_name,
            v.price, v.stock,
            i.image_url,
            COALESCE(r.average_rating, 0) as average_rating,
            COALESCE(r.review_count, 0) as review_count,
            COALESCE(o.sold_count, 0) as sold_count
        FROM product_table p
        JOIN store_table s ON p.store_id = s.store_id
        JOIN category_table c ON p.category_id = c.category_id
        LEFT JOIN (
            SELECT product_id, MIN(price) as price, SUM(stock) as stock
            FROM product_variant_table
            GROUP BY product_id
        ) v ON p.product_id = v.product_id
        LEFT JOIN (
            SELECT product_id, MAX(image_url) as image_url
            FROM product_image_table
            GROUP BY product_id
        ) i ON p.product_id = i.product_id
        LEFT JOIN (
            SELECT product_id, AVG(rating) as average_rating, COUNT(review_id) as review_count
            FROM review_table
            GROUP BY product_id
        ) r ON p.product_id = r.product_id
        LEFT JOIN (
            SELECT oi.product_id, SUM(oi.quantity) as sold_count
            FROM order_items_table oi
            JOIN order_table ot ON oi.order_id = ot.order_id
            WHERE ot.status != 'cancelled'
            GROUP BY oi.product_id
        ) o ON p.product_id = o.product_id
        WHERE 1=1
    `;
    const params = [];

    if (q?.trim()) {
        sql += ' AND (p.product_name LIKE ? OR p.description LIKE ?)';
        const like = `%${q.trim()}%`;
        params.push(like, like);
    }
    if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
    if (store_id)    { sql += ' AND p.store_id = ?';    params.push(store_id); }

    if (sort_by === 'price_asc') {
        sql += ' ORDER BY v.price ASC';
    } else if (sort_by === 'price_desc') {
        sql += ' ORDER BY v.price DESC';
    } else if (sort_by === 'top_sales') {
        sql += ' ORDER BY sold_count DESC';
    } else {
        sql += ' ORDER BY p.created_at DESC';
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id) {
    const [rows] = await pool.query(
        `SELECT
            p.product_id, p.product_name, p.description, p.created_at,
            s.store_id, s.store_name, s.owner_id,
            c.category_id, c.category_name,
            v.price, v.stock,
            i.image_url,
            COALESCE(r.average_rating, 0) as average_rating,
            COALESCE(r.review_count, 0) as review_count,
            COALESCE(o.sold_count, 0) as sold_count
         FROM product_table p
         JOIN store_table s ON p.store_id = s.store_id
         JOIN category_table c ON p.category_id = c.category_id
         LEFT JOIN (
             SELECT product_id, MIN(price) as price, SUM(stock) as stock
             FROM product_variant_table
             WHERE product_id = ?
             GROUP BY product_id
         ) v ON p.product_id = v.product_id
         LEFT JOIN (
             SELECT product_id, MAX(image_url) as image_url
             FROM product_image_table
             WHERE product_id = ?
             GROUP BY product_id
         ) i ON p.product_id = i.product_id
         LEFT JOIN (
             SELECT product_id, AVG(rating) as average_rating, COUNT(review_id) as review_count
             FROM review_table
             WHERE product_id = ?
             GROUP BY product_id
         ) r ON p.product_id = r.product_id
         LEFT JOIN (
             SELECT oi.product_id, SUM(oi.quantity) as sold_count
             FROM order_items_table oi
             JOIN order_table ot ON oi.order_id = ot.order_id
             WHERE oi.product_id = ? AND ot.status != 'cancelled'
             GROUP BY oi.product_id
         ) o ON p.product_id = o.product_id
         WHERE p.product_id = ?
         LIMIT 1`,
        [id, id, id, id, id]
    );
    return rows[0] || null;
}

/**
 * Create a new product (handles variants and images transactionally).
 */
export async function createProduct({ store_id, category_id, product_name, description, price, stock, image_url }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [pResult] = await conn.query(
            `INSERT INTO product_table (store_id, category_id, product_name, description)
             VALUES (?, ?, ?, ?)`,
            [store_id, category_id, product_name, description ?? null]
        );
        const product_id = pResult.insertId;

        await conn.query(
            `INSERT INTO product_variant_table (product_id, variant_name, sku, price, stock)
             VALUES (?, 'Default', ?, ?, ?)`,
            [product_id, `SKU-${product_id}`, price, stock ?? 0]
        );

        if (image_url) {
            await conn.query(
                `INSERT INTO product_image_table (product_id, image_url)
                 VALUES (?, ?)`,
                [product_id, image_url]
            );
        }

        await conn.commit();
        return product_id;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Update an existing product.
 */
export async function updateProduct(id, { product_name, description, price, stock, image_url, category_id }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            `UPDATE product_table
             SET product_name = ?, description = ?, category_id = ?
             WHERE product_id = ?`,
            [product_name, description ?? null, category_id, id]
        );

        // Update first variant found
        const [variants] = await conn.query('SELECT variant_id FROM product_variant_table WHERE product_id = ? LIMIT 1', [id]);
        if (variants.length > 0) {
            await conn.query(
                'UPDATE product_variant_table SET price = ?, stock = ? WHERE variant_id = ?',
                [price, stock, variants[0].variant_id]
            );
        }

        // Update first image found or insert new
        if (image_url) {
            const [images] = await conn.query('SELECT image_id FROM product_image_table WHERE product_id = ? LIMIT 1', [id]);
            if (images.length > 0) {
                await conn.query(
                    'UPDATE product_image_table SET image_url = ? WHERE image_id = ?',
                    [image_url, images[0].image_id]
                );
            } else {
                await conn.query(
                    'INSERT INTO product_image_table (product_id, image_url) VALUES (?, ?)',
                    [id, image_url]
                );
            }
        }

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM product_image_table WHERE product_id = ?', [id]);
        await conn.query('DELETE FROM product_variant_table WHERE product_id = ?', [id]);
        await conn.query('DELETE FROM product_table WHERE product_id = ?', [id]);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

/**
 * Get store_id owned by a profile.
 */
export async function getStoreByOwner(profile_id) {
    const [rows] = await pool.query(
        'SELECT store_id FROM store_table WHERE owner_id = ? LIMIT 1',
        [profile_id]
    );
    return rows[0] || null;
}
