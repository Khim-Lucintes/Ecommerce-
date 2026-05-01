import pool from './lib/db.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
    try {
        const passwordHash = await bcrypt.hash('admin123', 12);
        
        // Get admin role ID
        const [roles] = await pool.query('SELECT role_id FROM role_table WHERE role_name = "admin"');
        if (roles.length === 0) {
            console.log('❌ Admin role not found. Please run seed_roles.js first.');
            process.exit(1);
        }
        const adminRoleId = roles[0].role_id;

        // Check if admin already exists
        const [existing] = await pool.query('SELECT profile_id FROM profile_table WHERE email = ?', ['admin@example.com']);
        
        if (existing.length > 0) {
            // Update existing user to admin
            await pool.query('UPDATE profile_table SET role_id = ?, password_hash = ? WHERE email = ?', [adminRoleId, passwordHash, 'admin@example.com']);
            console.log('✅ Updated existing admin@example.com to Admin role and reset password.');
        } else {
            // Insert new admin user
            await pool.query(
                `INSERT INTO profile_table (full_name, email, password_hash, role_id)
                 VALUES (?, ?, ?, ?)`,
                ['System Admin', 'admin@example.com', passwordHash, adminRoleId]
            );
            console.log('✅ New Admin user created!');
        }

        console.log('\n--- Admin Credentials ---');
        console.log('Email:    admin@example.com');
        console.log('Password: admin123');
        console.log('-------------------------\n');
    } catch (err) {
        console.error('Failed to seed admin:', err);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
