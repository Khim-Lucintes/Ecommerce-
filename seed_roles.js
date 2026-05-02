// seed_roles.js — Run once: node --env-file=.env.local seed_roles.js
const mysql = require('mysql2/promise');

const ROLES = ['customer', 'seller', 'admin', 'superadmin'];

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
        console.log('🌱 Seeding role_table...');
        // We do not use auto-increment insertion here, we TRUNCATE and insert exactly
        // to guarantee IDs: 1=customer, 2=seller, 3=admin, 4=superadmin.
        // But since foreign keys exist, we just update or ignore.
        for (const role of ROLES) {
            await pool.query(
                'INSERT IGNORE INTO role_table (role_name) VALUES (?)',
                [role]
            );
            console.log(`  ✓ ${role}`);
        }

        const [rows] = await pool.query('SELECT * FROM role_table');
        console.log('\n📋 Current roles:');
        rows.forEach(r => console.log(`  └─ [${r.role_id}] ${r.role_name}`));
        console.log('\n✅ Done.');
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
