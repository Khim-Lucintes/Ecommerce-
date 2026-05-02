// clean_db.js
// Drops the newly added tables from new_schema.md that are NOT used by the current application
const mysql = require('mysql2/promise');

async function main() {
    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USERNAME,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE || 'ecommerce_db',
        ssl: { rejectUnauthorized: true },
    });

    try {
        console.log('\n🧹 Cleaning up unused tables...\n');

        // Note: order is important due to foreign keys!
        const tablesToDrop = [
            'order_voucher_table',
            'voucher_table',
            'order_item_table',  // The new one, NOT order_items_table
            'cart_item_table',   // The new one, NOT cart_items_table
            'product_image_table',
            'product_variant_table'
        ];

        for (const table of tablesToDrop) {
            process.stdout.write(`  🗑️ Dropping ${table}... `);
            await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
            console.log('✓');
        }

        console.log('\n✅ Cleanup complete. The database now perfectly matches your application logic.\n');

        // Check product_table columns
        const [columns] = await pool.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_table'
        `, [process.env.TIDB_DATABASE || 'ecommerce_db']);
        
        console.log('📋 Current `product_table` columns:');
        columns.forEach(c => console.log(`  - ${c.COLUMN_NAME} (${c.COLUMN_TYPE})`));

    } catch (err) {
        console.error('\n❌ Failed:', err.message);
    } finally {
        await pool.end();
    }
}

main();
