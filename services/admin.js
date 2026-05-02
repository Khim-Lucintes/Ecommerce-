import pool from '@/lib/db';

export async function getAdminStats() {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM profile_table');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM product_table');
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM order_table');
    const [[{ total_sales }]] = await pool.query('SELECT SUM(total_amount) AS total_sales FROM order_table WHERE status != "cancelled"');

    return {
        total_users,
        total_products,
        total_orders,
        total_sales: total_sales || 0
    };
}

export async function getSalesAnalytics() {
    const [rows] = await pool.query(`
        SELECT DATE(created_at) as raw_date, SUM(total_amount) as revenue, COUNT(order_id) as orders
        FROM order_table
        WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
        ORDER BY raw_date ASC
    `);

    const analytics = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const match = rows.find(r => {
            const rDate = new Date(r.raw_date);
            return new Date(rDate.getTime() - rDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] === dateStr;
        });

        analytics.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: match ? Number(match.revenue) : 0,
            orders: match ? Number(match.orders) : 0
        });
    }
    return analytics;
}

export async function getAllUsers(limit = 50) {
    const [rows] = await pool.query(`
        SELECT p.profile_id, p.full_name, p.email, p.created_at, r.role_name
        FROM profile_table p
        JOIN role_table r ON p.role_id = r.role_id
        ORDER BY p.created_at DESC
        LIMIT ?
    `, [limit]);
    return rows;
}

export async function getAllProducts() {
    const [rows] = await pool.query(`
        SELECT p.product_id, p.product_name, v.price, v.stock, p.created_at,
               c.category_name, s.store_name
        FROM product_table p
        JOIN category_table c ON p.category_id = c.category_id
        JOIN store_table s ON p.store_id = s.store_id
        LEFT JOIN (
            SELECT product_id, MIN(price) as price, SUM(stock) as stock
            FROM product_variant_table
            GROUP BY product_id
        ) v ON p.product_id = v.product_id
        ORDER BY p.created_at DESC
    `);
    return rows;
}

export async function getAllOrders() {
    const [rows] = await pool.query(`
        SELECT o.order_id, o.total_amount, o.status, o.created_at,
               p.full_name AS buyer_name,
               pay.payment_method, pay.payment_status
        FROM order_table o
        JOIN profile_table p ON o.buyer_id = p.profile_id
        LEFT JOIN payment_table pay ON o.order_id = pay.order_id
        ORDER BY o.created_at DESC
    `);
    return rows;
}

export async function updateUserRole(profile_id, role_id) {
    await pool.query('UPDATE profile_table SET role_id = ? WHERE profile_id = ?', [role_id, profile_id]);
}
