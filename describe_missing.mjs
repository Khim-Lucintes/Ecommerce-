import mysql from 'mysql2/promise';

async function describeTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: parseInt(process.env.TIDB_PORT || '4000', 10),
            user: process.env.TIDB_USERNAME,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: { rejectUnauthorized: true },
        });

        const tables = ['cart_items_table', 'order_items_table'];
        for (const table of tables) {
            console.log(`\nStructure of ${table}:`);
            const [rows] = await connection.query(`DESCRIBE ${table}`);
            console.table(rows);
        }
        await connection.end();
    } catch (err) {
        console.error('Error:', err.message);
    }
}

describeTables();
