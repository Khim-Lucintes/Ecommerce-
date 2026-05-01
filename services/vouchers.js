import pool from '@/lib/db';

export async function applyVoucher(code, cartTotal) {
    const [rows] = await pool.query(
        `SELECT * FROM vouchers_table
         WHERE code = ?
           AND is_active = TRUE
           AND (expires_at IS NULL OR expires_at > NOW())
           AND (usage_limit IS NULL OR used_count < usage_limit)
         LIMIT 1`,
        [code.toUpperCase().trim()]
    );

    if (rows.length === 0) throw new Error('Invalid or expired voucher code.');

    const voucher = rows[0];
    if (cartTotal < Number(voucher.min_purchase)) {
        throw new Error(`Minimum purchase of ₱${Number(voucher.min_purchase).toLocaleString()} required.`);
    }

    let discount = 0;
    if (voucher.discount_type === 'percentage') {
        discount = (cartTotal * Number(voucher.discount_value)) / 100;
    } else {
        discount = Math.min(Number(voucher.discount_value), cartTotal);
    }

    return {
        voucher_id:   voucher.voucher_id,
        code:         voucher.code,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        discount:     Number(discount.toFixed(2)),
        final_total:  Number((cartTotal - discount).toFixed(2)),
    };
}

export async function redeemVoucher(voucher_id) {
    await pool.query(
        'UPDATE vouchers_table SET used_count = used_count + 1 WHERE voucher_id = ?',
        [voucher_id]
    );
}

export async function createVoucher({ code, discount_type, discount_value, min_purchase = 0, expires_at = null, usage_limit = null }) {
    const [result] = await pool.query(
        `INSERT INTO vouchers_table (code, discount_type, discount_value, min_purchase, expires_at, usage_limit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [code.toUpperCase().trim(), discount_type, discount_value, min_purchase, expires_at, usage_limit]
    );
    return result.insertId;
}

export async function getAllVouchers() {
    const [rows] = await pool.query('SELECT * FROM vouchers_table ORDER BY created_at DESC');
    return rows;
}

export async function toggleVoucher(voucher_id, is_active) {
    await pool.query('UPDATE vouchers_table SET is_active = ? WHERE voucher_id = ?', [is_active, voucher_id]);
}
