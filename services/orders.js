import pool from '@/lib/db';
import { getCartItems, getOrCreateCart } from './cart';

export async function createOrder(profile_id, address_id = null) {
    const items = await getCartItems(profile_id);
    if (items.length === 0) throw new Error('Cart is empty');

    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Verify stock for all items
        // Wait, items in cart currently don't specify variant_id, they just use product_id.
        // We'll update the first variant found for the product.
        for (const item of items) {
            const [rows] = await conn.query('SELECT variant_id, stock FROM product_variant_table WHERE product_id = ? FOR UPDATE', [item.product_id]);
            if (rows.length === 0 || rows[0].stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product_name}`);
            }
            item.variant_id = rows[0].variant_id; // Store for deduction
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
                'UPDATE product_variant_table SET stock = stock - ? WHERE variant_id = ?',
                [item.quantity, item.variant_id]
            );
        }

        // 5. Create shipment record (links order to delivery address)
        if (address_id) {
            await conn.query(
                `INSERT INTO shipment_table (order_id, address_id, status) VALUES (?, ?, 'pending')`,
                [order_id, address_id]
            );
        }

        // 6. Clear cart
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
        SELECT oi.*, p.product_name, i.image_url, s.store_name
        FROM order_items_table oi
        JOIN product_table p ON oi.product_id = p.product_id
        JOIN store_table s ON p.store_id = s.store_id
        LEFT JOIN (
            SELECT product_id, MAX(image_url) as image_url
            FROM product_image_table
            GROUP BY product_id
        ) i ON p.product_id = i.product_id
        WHERE oi.order_id = ?
    `, [order_id]);
    return rows;
}

export async function getOrderWithShipment(order_id, profile_id) {
    const [[order]] = await pool.query(`
        SELECT o.*, 
               p.payment_method, p.payment_status, p.paid_at,
               sh.status AS shipment_status, sh.courier, sh.tracking_number,
               sh.shipped_at, sh.delivered_at,
               a.full_address, a.city, a.postal_code
        FROM order_table o
        LEFT JOIN payment_table p ON p.order_id = o.order_id
        LEFT JOIN shipment_table sh ON sh.order_id = o.order_id
        LEFT JOIN address_table a ON a.address_id = sh.address_id
        WHERE o.order_id = ? AND o.buyer_id = ?
    `, [order_id, profile_id]);
    return order || null;
}
