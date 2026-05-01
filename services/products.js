import pool from '@/lib/db';

/**
 * Get all products with store and category info.
 * @param {{ limit?: number, offset?: number, category_id?: number, store_id?: number }} opts
 */
export async function getProducts({ limit = 20, offset = 0, category_id, store_id } = {}) {
    let sql = `
        SELECT
            p.product_id, p.product_name, p.description,
            p.price, p.stock, p.image_url, p.created_at,
            s.store_id, s.store_name,
            c.category_id, c.category_name
        FROM product_table p
        JOIN store_table   s ON p.store_id    = s.store_id
        JOIN category_table c ON p.category_id = c.category_id
        WHERE 1=1
    `;
    const params = [];

    if (category_id) { sql += ' AND p.category_id = ?'; params.push(category_id); }
    if (store_id)    { sql += ' AND p.store_id = ?';    params.push(store_id); }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
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
            p.product_id, p.product_name, p.description,
            p.price, p.stock, p.image_url, p.created_at,
            s.store_id, s.store_name,
            c.category_id, c.category_name
         FROM product_table p
         JOIN store_table   s ON p.store_id    = s.store_id
         JOIN category_table c ON p.category_id = c.category_id
         WHERE p.product_id = ?
         LIMIT 1`,
        [id]
    );
    return rows[0] || null;
}

/**
 * Create a new product. Returns the new product_id.
 */
export async function createProduct({ store_id, category_id, product_name, description, price, stock, image_url }) {
    const [result] = await pool.query(
        `INSERT INTO product_table (store_id, category_id, product_name, description, price, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [store_id, category_id, product_name, description ?? null, price, stock ?? 0, image_url ?? null]
    );
    return result.insertId;
}

/**
 * Update an existing product. Only the seller who owns the store can do this (enforced at the API layer).
 */
export async function updateProduct(id, { product_name, description, price, stock, image_url, category_id }) {
    await pool.query(
        `UPDATE product_table
         SET product_name = ?, description = ?, price = ?, stock = ?, image_url = ?, category_id = ?
         WHERE product_id = ?`,
        [product_name, description ?? null, price, stock, image_url ?? null, category_id, id]
    );
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id) {
    await pool.query('DELETE FROM product_table WHERE product_id = ?', [id]);
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
