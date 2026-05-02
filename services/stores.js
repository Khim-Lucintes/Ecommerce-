import pool from '@/lib/db';

export async function getStoreByOwner(profile_id) {
    const [rows] = await pool.query('SELECT * FROM store_table WHERE owner_id = ? LIMIT 1', [profile_id]);
    return rows[0] || null;
}

export async function createStore(profile_id, store_name, description = '') {
    const [result] = await pool.query(
        'INSERT INTO store_table (owner_id, store_name, description) VALUES (?, ?, ?)',
        [profile_id, store_name, description]
    );
    return result.insertId;
}

export async function getProductsByStore(store_id) {
    const [rows] = await pool.query(`
        SELECT p.*, c.category_name, v.price, v.stock, i.image_url
        FROM product_table p
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
        WHERE p.store_id = ?
        ORDER BY p.created_at DESC
    `, [store_id]);
    return rows;
}

export async function getOrdersByStore(store_id) {
    const [rows] = await pool.query(`
        SELECT o.order_id, o.status, o.created_at, 
               oi.quantity, oi.price, 
               p.product_name, pr.full_name AS buyer_name
        FROM order_table o
        JOIN order_items_table oi ON o.order_id = oi.order_id
        JOIN product_table p ON oi.product_id = p.product_id
        JOIN profile_table pr ON o.buyer_id = pr.profile_id
        WHERE p.store_id = ?
        ORDER BY o.created_at DESC
    `, [store_id]);
    return rows;
}
