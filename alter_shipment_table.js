// alter_shipment_table.js
// Adds missing columns and FK to shipment_table per new_schema.md
// Safe to re-run — each ALTER is wrapped in try/catch.

const mysql = require('mysql2/promise');

const DB_NAME = process.env.TIDB_DATABASE || 'ecommerce_db';

async function columnExists(pool, table, column) {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS cnt
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [DB_NAME, table, column]
    );
    return rows[0].cnt > 0;
}

async function main() {
    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USERNAME,
        password: process.env.TIDB_PASSWORD,
        database: DB_NAME,
        ssl: { rejectUnauthorized: true },
    });

    try {
        console.log(`\n🔗 Connected to '${DB_NAME}'\n`);

        // ── 1. Add address_id column ──────────────────────────────────────────
        if (await columnExists(pool, 'shipment_table', 'address_id')) {
            console.log('  ✔️  address_id already exists — skipping.');
        } else {
            console.log('  🆕 Adding address_id column...');
            // Add as NULL first so existing rows don't fail
            await pool.query(`
                ALTER TABLE shipment_table
                ADD COLUMN address_id INT NULL
                AFTER order_id
            `);
            console.log('  ✓  address_id added.');
        }

        // ── 2. Add shipped_at column ──────────────────────────────────────────
        if (await columnExists(pool, 'shipment_table', 'shipped_at')) {
            console.log('  ✔️  shipped_at already exists — skipping.');
        } else {
            console.log('  🆕 Adding shipped_at column...');
            await pool.query(`
                ALTER TABLE shipment_table
                ADD COLUMN shipped_at TIMESTAMP NULL
                AFTER status
            `);
            console.log('  ✓  shipped_at added.');
        }

        // ── 3. Add delivered_at column ────────────────────────────────────────
        if (await columnExists(pool, 'shipment_table', 'delivered_at')) {
            console.log('  ✔️  delivered_at already exists — skipping.');
        } else {
            console.log('  🆕 Adding delivered_at column...');
            await pool.query(`
                ALTER TABLE shipment_table
                ADD COLUMN delivered_at TIMESTAMP NULL
                AFTER shipped_at
            `);
            console.log('  ✓  delivered_at added.');
        }

        // ── 4. Add FK on address_id ───────────────────────────────────────────
        console.log('  🔗 Adding FK constraint for address_id...');
        try {
            await pool.query(`
                ALTER TABLE shipment_table
                ADD CONSTRAINT fk_shipment_address
                FOREIGN KEY (address_id) REFERENCES address_table(address_id)
            `);
            console.log('  ✓  FK fk_shipment_address added.');
        } catch (err) {
            if (err.code === 'ER_DUP_KEY' || err.message.includes('Duplicate key name') || err.message.includes('already exists')) {
                console.log('  ✔️  FK already exists — skipping.');
            } else {
                console.log(`  ⚠️  FK warning: ${err.message}`);
            }
        }

        // ── 5. Show final structure ───────────────────────────────────────────
        const [cols] = await pool.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shipment_table'
            ORDER BY ORDINAL_POSITION
        `, [DB_NAME]);

        console.log('\n📋 shipment_table structure after ALTER:\n');
        console.log('  Column'.padEnd(22) + 'Type'.padEnd(30) + 'Nullable');
        console.log('  ' + '-'.repeat(60));
        cols.forEach(c => {
            console.log(`  ${c.COLUMN_NAME.padEnd(20)} ${c.COLUMN_TYPE.padEnd(30)} ${c.IS_NULLABLE}`);
        });

        console.log('\n✅ ALTER complete!\n');

    } catch (err) {
        console.error('\n❌ Failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
