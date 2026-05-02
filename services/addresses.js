import pool from '@/lib/db';

/** Get all saved addresses for a user */
export async function getAddressesByUser(profile_id) {
    const [rows] = await pool.query(
        'SELECT * FROM address_table WHERE profile_id = ? ORDER BY address_id DESC',
        [profile_id]
    );
    return rows;
}

/** Add a new address */
export async function addAddress(profile_id, { full_address, city, postal_code }) {
    const [result] = await pool.query(
        'INSERT INTO address_table (profile_id, full_address, city, postal_code) VALUES (?, ?, ?, ?)',
        [profile_id, full_address, city || null, postal_code || null]
    );
    return result.insertId;
}

/** Delete an address (only if it belongs to the user) */
export async function deleteAddress(address_id, profile_id) {
    const [result] = await pool.query(
        'DELETE FROM address_table WHERE address_id = ? AND profile_id = ?',
        [address_id, profile_id]
    );
    return result.affectedRows > 0;
}
