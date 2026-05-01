require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const DB_NAME = 'ecommerce_db';

const CATEGORIES = [
    'Electronics',
    'Clothing & Apparel',
    'Home & Living',
    'Health & Beauty',
    'Toys & Games',
    'Sports & Outdoors',
    'Automotive',
    'Groceries'
];

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
        console.log('Seeding categories...');
        for (const cat of CATEGORIES) {
            await pool.query('INSERT IGNORE INTO category_table (category_name) VALUES (?)', [cat]);
            console.log(`  Inserted: ${cat}`);
        }
        console.log('Categories seeded successfully.');
    } catch (err) {
        console.error('Failed to seed categories:', err);
    } finally {
        await pool.end();
    }
}

main();
