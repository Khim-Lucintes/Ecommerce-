import pool from './lib/db.js';

async function updateRoles() {
    try {
        console.log('Starting role IDs migration...');
        
        // Disable foreign key checks to avoid constraint errors
        await pool.query('SET FOREIGN_KEY_CHECKS=0');

        // Swap admin (1) and customer (3)
        // 1. Move admin (1) to temp (11)
        await pool.query('UPDATE profile_table SET role_id = 11 WHERE role_id = 1');
        await pool.query('UPDATE role_table SET role_id = 11 WHERE role_id = 1');

        // 2. Move customer (3) to temp (33)
        await pool.query('UPDATE profile_table SET role_id = 33 WHERE role_id = 3');
        await pool.query('UPDATE role_table SET role_id = 33 WHERE role_id = 3');

        // 3. Move temp admin (11) to 3
        await pool.query('UPDATE profile_table SET role_id = 3 WHERE role_id = 11');
        await pool.query('UPDATE role_table SET role_id = 3 WHERE role_id = 11');

        // 4. Move temp customer (33) to 1
        await pool.query('UPDATE profile_table SET role_id = 1 WHERE role_id = 33');
        await pool.query('UPDATE role_table SET role_id = 1 WHERE role_id = 33');

        // Re-enable foreign key checks
        await pool.query('SET FOREIGN_KEY_CHECKS=1');

        console.log('Successfully updated role mappings in database!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating roles:', err);
        process.exit(1);
    }
}

updateRoles();
