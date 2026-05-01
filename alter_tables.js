// alter_tables.js — Run once: node --env-file=.env.local alter_tables.js
// Adds missing columns to product_table that are needed for the ecommerce system
const mysql = require('mysql2/promise');

const ALTERATIONS = [
    {
        description: 'Add price to product_table',
        sql: 'ALTER TABLE product_table ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00',
        check: "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'product_table' AND column_name = 'price'",
    },
    {
        description: 'Add stock to product_table',
        sql: 'ALTER TABLE product_table ADD COLUMN stock INT NOT NULL DEFAULT 0',
        check: "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'product_table' AND column_name = 'stock'",
    },
    {
        description: 'Add image_url to product_table',
        sql: 'ALTER TABLE product_table ADD COLUMN image_url TEXT',
        check: "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'product_table' AND column_name = 'image_url'",
    },
    {
        description: 'Add amount to payment_table',
        sql: 'ALTER TABLE payment_table ADD COLUMN amount DECIMAL(10,2) NOT NULL DEFAULT 0.00',
        check: "SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'payment_table' AND column_name = 'amount'",
    },
];

async function main() {
    const pool = mysql.createPool({
        host:     process.env.TIDB_HOST,
        port:     parseInt(process.env.TIDB_PORT || '4000'),
        user:     process.env.TIDB_USERNAME,
        password: process.env.TIDB_PASSWORD,
        database: process.env.TIDB_DATABASE,
        ssl: { rejectUnauthorized: true },
    });

    try {
        console.log('🔧 Applying table alterations...\n');
        for (const { description, sql, check } of ALTERATIONS) {
            process.stdout.write(`  ├─ ${description}... `);
            const [exists] = await pool.query(check, [process.env.TIDB_DATABASE]);
            if (exists.length > 0) {
                console.log('⏭  already exists');
            } else {
                await pool.query(sql);
                console.log('✓ added');
            }
        }
        console.log('\n✅ Alterations complete.');
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
