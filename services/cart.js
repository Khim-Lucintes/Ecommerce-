import pool from '@/lib/db';

export async function getCartItems(profile_id) {
    const [rows] = await pool.query(`
        SELECT ci.cart_item_id, ci.quantity, 
               p.product_id, p.product_name, 
               v.price, i.image_url, v.stock,
               s.store_name
        FROM cart_items_table ci
        JOIN cart_table c ON ci.cart_id = c.cart_id
        JOIN product_table p ON ci.product_id = p.product_id
        JOIN store_table s ON p.store_id = s.store_id
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
        WHERE c.profile_id = ?
    `, [profile_id]);
    return rows;
}

export async function getOrCreateCart(profile_id) {
    const [carts] = await pool.query('SELECT cart_id FROM cart_table WHERE profile_id = ? LIMIT 1', [profile_id]);
    if (carts.length > 0) return carts[0].cart_id;
    const [result] = await pool.query('INSERT INTO cart_table (profile_id) VALUES (?)', [profile_id]);
    return result.insertId;
}

export async function addToCart(profile_id, product_id, quantity) {
    const cart_id = await getOrCreateCart(profile_id);
    const [existing] = await pool.query(
        'SELECT cart_item_id, quantity FROM cart_items_table WHERE cart_id = ? AND product_id = ?',
        [cart_id, product_id]
    );

    if (existing.length > 0) {
        await pool.query(
            'UPDATE cart_items_table SET quantity = quantity + ? WHERE cart_item_id = ?',
            [quantity, existing[0].cart_item_id]
        );
    } else {
        await pool.query(
            'INSERT INTO cart_items_table (cart_id, product_id, quantity) VALUES (?, ?, ?)',
            [cart_id, product_id, quantity]
        );
    }
}

export async function updateCartItem(cart_item_id, quantity) {
    await pool.query('UPDATE cart_items_table SET quantity = ? WHERE cart_item_id = ?', [quantity, cart_item_id]);
}

export async function removeCartItem(cart_item_id) {
    await pool.query('DELETE FROM cart_items_table WHERE cart_item_id = ?', [cart_item_id]);
}

export async function clearCart(cart_id) {
    await pool.query('DELETE FROM cart_items_table WHERE cart_id = ?', [cart_id]);
}
