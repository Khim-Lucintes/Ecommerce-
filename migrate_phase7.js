import pool from './lib/db.js';

async function migrate() {
    const conn = await pool.getConnection();
    try {
        console.log('Running Phase 7 migrations...');

        await conn.query(`
            CREATE TABLE IF NOT EXISTS messages_table (
                message_id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                product_id INT DEFAULT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES profile_table(profile_id),
                FOREIGN KEY (receiver_id) REFERENCES profile_table(profile_id)
            )
        `);
        console.log('✅ messages_table created');

        await conn.query(`
            CREATE TABLE IF NOT EXISTS wishlist_table (
                wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
                profile_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY uq_wishlist (profile_id, product_id),
                FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id),
                FOREIGN KEY (product_id) REFERENCES product_table(product_id)
            )
        `);
        console.log('✅ wishlist_table created');

        await conn.query(`
            CREATE TABLE IF NOT EXISTS vouchers_table (
                voucher_id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount_type ENUM('percentage', 'fixed') NOT NULL,
                discount_value DECIMAL(10,2) NOT NULL,
                min_purchase DECIMAL(10,2) DEFAULT 0,
                expires_at TIMESTAMP NULL,
                usage_limit INT DEFAULT NULL,
                used_count INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ vouchers_table created');

        console.log('\n🎉 Phase 7 migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        conn.release();
        process.exit(0);
    }
}

migrate();
