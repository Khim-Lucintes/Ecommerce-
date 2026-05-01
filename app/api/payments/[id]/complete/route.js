import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

        if (!payload) {
            return Response.json({ error: 'Login required' }, { status: 401 });
        }

        const { payment_method } = await request.json(); // e.g. 'gcash', 'paypal'

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Verify order belongs to user and is pending
            const [orders] = await conn.query(
                'SELECT status FROM order_table WHERE order_id = ? AND buyer_id = ? FOR UPDATE',
                [Number(id), payload.id]
            );

            if (orders.length === 0) {
                throw new Error('Order not found or access denied');
            }

            if (orders[0].status !== 'pending') {
                throw new Error('Order is already paid or cancelled');
            }

            // Update payment record
            await conn.query(
                `UPDATE payment_table
                 SET payment_status = 'paid', payment_method = ?, paid_at = CURRENT_TIMESTAMP
                 WHERE order_id = ?`,
                [payment_method || 'unknown', Number(id)]
            );

            // Update order status
            await conn.query(
                `UPDATE order_table SET status = 'paid' WHERE order_id = ?`,
                [Number(id)]
            );

            await conn.commit();
            return Response.json({ message: 'Payment successful' });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('[POST /api/payments/[id]/complete]', err);
        return Response.json({ error: err.message || 'Payment failed' }, { status: 500 });
    }
}
