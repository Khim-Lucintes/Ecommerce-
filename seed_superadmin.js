const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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
        console.log('👑 Seeding Superadmin...');
        
        // 1. Ensure superadmin role exists
        await pool.query('INSERT IGNORE INTO role_table (role_name) VALUES (?)', ['superadmin']);
        const [roles] = await pool.query('SELECT role_id FROM role_table WHERE role_name = ?', ['superadmin']);
        const role_id = roles[0].role_id;

        // 2. Create superadmin account
        const email = 'superadmin@lazapee.com';
        const password = 'password123';
        const hashed = await bcrypt.hash(password, 12);

        const [existing] = await pool.query('SELECT profile_id FROM profile_table WHERE email = ?', [email]);
        
        if (existing.length === 0) {
            await pool.query(
                'INSERT INTO profile_table (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
                ['Lazapee Superadmin', email, hashed, role_id]
            );
            console.log(`✅ Superadmin created!`);
            console.log(`   Email: ${email}`);
            console.log(`   Pass:  ${password}`);
        } else {
            // Update to superadmin role if it already exists
            await pool.query('UPDATE profile_table SET role_id = ? WHERE email = ?', [role_id, email]);
            console.log(`✅ Superadmin already exists. Role ensured to be superadmin.`);
        }

    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await pool.end();
    }
}

main();
