import pool from '@/lib/db';
import { getCartItems, clearCart, getOrCreateCart } from './cart';

export async function createOrder(profile_id) {
    const items = await getCartItems(profile_id);
    if (items.length === 0) throw new Error('Cart is empty');

    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Verify stock for all items
        for (const item of items) {
            const [rows] = await conn.query('SELECT stock FROM product_table WHERE product_id = ? FOR UPDATE', [item.product_id]);
            if (rows.length === 0 || rows[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product_name}`);
            }
        }

        // 2. Create order
        const [orderResult] = await conn.query(
            'INSERT INTO order_table (buyer_id, total_amount, status) VALUES (?, ?, ?)',
            [profile_id, total, 'pending']
        );
        const order_id = orderResult.insertId;

        // 3. Create payment record (pending)
        await conn.query(
            'INSERT INTO payment_table (order_id, payment_status) VALUES (?, ?)',
            [order_id, 'pending']
        );

        // 4. Insert items and deduct stock
        for (const item of items) {
            await conn.query(
                'INSERT INTO order_items_table (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [order_id, item.product_id, item.quantity, item.price]
            );
            await conn.query(
                'UPDATE product_table SET stock = stock - ? WHERE product_id = ?',
                [item.quantity, item.product_id]
            );
        }

        // 5. Clear cart
        const cart_id = await getOrCreateCart(profile_id);
        await conn.query('DELETE FROM cart_items_table WHERE cart_id = ?', [cart_id]);

        await conn.commit();
        return order_id;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function getOrdersByBuyer(profile_id) {
    const [rows] = await pool.query(
        'SELECT * FROM order_table WHERE buyer_id = ? ORDER BY created_at DESC',
        [profile_id]
    );
    return rows;
}

export async function getOrderItems(order_id) {
    const [rows] = await pool.query(`
        SELECT oi.*, p.product_name, p.image_url, s.store_name
        FROM order_items_table oi
        JOIN product_table p ON oi.product_id = p.product_id
        JOIN store_table s ON p.store_id = s.store_id
        WHERE oi.order_id = ?
    `, [order_id]);
    return rows;
}
