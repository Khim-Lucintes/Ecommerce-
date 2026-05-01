import pool from '@/lib/db';

/**
 * Get all categories (flat list).
 */
export async function getCategories() {
    const [rows] = await pool.query(
        'SELECT category_id, category_name, parent_id FROM category_table ORDER BY category_name'
    );
    return rows;
}

/**
 * Get a single category by ID.
 */
export async function getCategoryById(id) {
    const [rows] = await pool.query(
        'SELECT * FROM category_table WHERE category_id = ? LIMIT 1',
        [id]
    );
    return rows[0] || null;
}
