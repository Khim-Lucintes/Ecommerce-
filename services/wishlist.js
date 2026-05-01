import pool from '@/lib/db';

export async function getWishlist(profile_id) {
    const [rows] = await pool.query(
        `SELECT w.wishlist_id, w.created_at,
                p.product_id, p.product_name, p.price, p.image_url, p.stock,
                c.category_name, s.store_name
         FROM wishlist_table w
         JOIN product_table p ON w.product_id = p.product_id
         JOIN category_table c ON p.category_id = c.category_id
         JOIN store_table s ON p.store_id = s.store_id
         WHERE w.profile_id = ?
         ORDER BY w.created_at DESC`,
        [profile_id]
    );
    return rows;
}

export async function addToWishlist(profile_id, product_id) {
    try {
        await pool.query(
            'INSERT INTO wishlist_table (profile_id, product_id) VALUES (?, ?)',
            [profile_id, product_id]
        );
        return { added: true };
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return { added: false };
        throw err;
    }
}

export async function removeFromWishlist(profile_id, product_id) {
    await pool.query(
        'DELETE FROM wishlist_table WHERE profile_id = ? AND product_id = ?',
        [profile_id, product_id]
    );
}

export async function isWishlisted(profile_id, product_id) {
    const [rows] = await pool.query(
        'SELECT wishlist_id FROM wishlist_table WHERE profile_id = ? AND product_id = ? LIMIT 1',
        [profile_id, product_id]
    );
    return rows.length > 0;
}
