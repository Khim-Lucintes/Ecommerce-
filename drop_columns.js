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
        console.log('Dropping price, stock, image_url from product_table...');
        // Drop them if they exist
        const [cols] = await pool.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_table'`, [process.env.TIDB_DATABASE || 'ecommerce_db']);
        const colNames = cols.map(c => c.COLUMN_NAME);
        
        let dropQueries = [];
        if (colNames.includes('price')) dropQueries.push('DROP COLUMN price');
        if (colNames.includes('stock')) dropQueries.push('DROP COLUMN stock');
        if (colNames.includes('image_url')) dropQueries.push('DROP COLUMN image_url');

        if (dropQueries.length > 0) {
            await pool.query(`ALTER TABLE product_table ${dropQueries.join(', ')}`);
            console.log('Columns dropped successfully!');
        } else {
            console.log('Columns already dropped.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();
