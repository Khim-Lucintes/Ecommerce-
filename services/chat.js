import pool from '@/lib/db';

/**
 * Get conversation between two users (ordered by time).
 * Conversation ID = sorted pair: "smallerId_largerId"
 */
export async function getMessages(userId, otherId) {
    const [rows] = await pool.query(
        `SELECT m.message_id, m.content, m.created_at, m.is_read, m.product_id,
                m.sender_id, p.full_name AS sender_name
         FROM messages_table m
         JOIN profile_table p ON m.sender_id = p.profile_id
         WHERE (m.sender_id = ? AND m.receiver_id = ?)
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC`,
        [userId, otherId, otherId, userId]
    );
    return rows;
}

export async function sendMessage({ sender_id, receiver_id, content, product_id = null }) {
    const [result] = await pool.query(
        'INSERT INTO messages_table (sender_id, receiver_id, content, product_id) VALUES (?, ?, ?, ?)',
        [sender_id, receiver_id, content.trim(), product_id]
    );
    return result.insertId;
}

export async function markRead(userId, otherId) {
    await pool.query(
        'UPDATE messages_table SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
        [userId, otherId]
    );
}

export async function getConversations(userId) {
    const [rows] = await pool.query(
        `SELECT
            p.profile_id AS other_id,
            p.full_name AS other_name,
            sub.last_msg,
            sub.last_at,
            SUM(CASE WHEN m2.receiver_id = ? AND m2.is_read = FALSE THEN 1 ELSE 0 END) AS unread
         FROM (
             SELECT
                 IF(sender_id = ?, receiver_id, sender_id) AS other_id,
                 MAX(content) AS last_msg,
                 MAX(created_at) AS last_at
             FROM messages_table
             WHERE sender_id = ? OR receiver_id = ?
             GROUP BY other_id
         ) sub
         JOIN profile_table p ON p.profile_id = sub.other_id
         JOIN messages_table m2 ON (
             (m2.sender_id = sub.other_id AND m2.receiver_id = ?)
             OR (m2.sender_id = ? AND m2.receiver_id = sub.other_id)
         )
         GROUP BY p.profile_id, p.full_name, sub.last_msg, sub.last_at
         ORDER BY sub.last_at DESC`,
        [userId, userId, userId, userId, userId, userId]
    );
    return rows;
}
