import pool from '@/lib/db';

export async function getReviewsByProduct(product_id) {
    const [rows] = await pool.query(
        `SELECT
            r.review_id, r.rating, r.comment, r.created_at,
            p.full_name AS reviewer_name
         FROM review_table r
         JOIN profile_table p ON r.profile_id = p.profile_id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`,
        [product_id]
    );
    return rows;
}

export async function getProductRating(product_id) {
    const [rows] = await pool.query(
        `SELECT
            COUNT(*)           AS count,
            AVG(rating)        AS average,
            SUM(rating = 5)    AS five,
            SUM(rating = 4)    AS four,
            SUM(rating = 3)    AS three,
            SUM(rating = 2)    AS two,
            SUM(rating = 1)    AS one
         FROM review_table
         WHERE product_id = ?`,
        [product_id]
    );
    return {
        count:   Number(rows[0].count),
        average: rows[0].average ? Number(rows[0].average).toFixed(1) : null,
        breakdown: {
            5: Number(rows[0].five),
            4: Number(rows[0].four),
            3: Number(rows[0].three),
            2: Number(rows[0].two),
            1: Number(rows[0].one),
        },
    };
}

export async function hasUserReviewed(profile_id, product_id) {
    const [rows] = await pool.query(
        'SELECT review_id FROM review_table WHERE profile_id = ? AND product_id = ? LIMIT 1',
        [profile_id, product_id]
    );
    return rows.length > 0;
}

export async function submitReview({ profile_id, product_id, rating, comment }) {
    const already = await hasUserReviewed(profile_id, product_id);
    if (already) throw new Error('You have already reviewed this product.');

    if (!rating || rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5.');

    const [result] = await pool.query(
        'INSERT INTO review_table (profile_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
        [profile_id, product_id, rating, comment?.trim() || null]
    );
    return result.insertId;
}
