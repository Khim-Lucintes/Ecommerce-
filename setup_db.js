const mysql = require('mysql2/promise');

const DB_NAME = 'ecommerce_db';

async function main() {
    // Connect WITHOUT specifying a database so we can CREATE DATABASE first
    const pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: parseInt(process.env.TIDB_PORT || '4000'),
        user: process.env.TIDB_USERNAME,
        password: process.env.TIDB_PASSWORD,
        ssl: { rejectUnauthorized: true },
    });

    try {
        // ── Step 1: Create the database ────────────────────────────────────
        console.log(`\n📦 Creating database '${DB_NAME}' if it does not exist...`);
        await pool.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
        console.log(`✓ Database '${DB_NAME}' ready.\n`);

        // ── Step 2: Switch into it ─────────────────────────────────────────
        await pool.query(`USE \`${DB_NAME}\``);

        // ── Step 3: Create tables in FK-dependency order ───────────────────
        const tables = [
            {
                name: 'role_table',
                sql: `CREATE TABLE IF NOT EXISTS role_table (
                    role_id   INT AUTO_INCREMENT PRIMARY KEY,
                    role_name VARCHAR(50) NOT NULL UNIQUE
                )`,
            },
            {
                name: 'profile_table',
                sql: `CREATE TABLE IF NOT EXISTS profile_table (
                    profile_id    INT AUTO_INCREMENT PRIMARY KEY,
                    role_id       INT NOT NULL,
                    full_name     VARCHAR(100) NOT NULL,
                    email         VARCHAR(100) NOT NULL UNIQUE,
                    username      VARCHAR(50)  UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    phone         VARCHAR(20),
                    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (role_id) REFERENCES role_table(role_id)
                )`,
            },
            {
                name: 'store_table',
                sql: `CREATE TABLE IF NOT EXISTS store_table (
                    store_id    INT AUTO_INCREMENT PRIMARY KEY,
                    owner_id    INT NOT NULL,
                    store_name  VARCHAR(100) NOT NULL,
                    description TEXT,
                    logo_url    TEXT,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES profile_table(profile_id)
                )`,
            },
            {
                name: 'category_table',
                sql: `CREATE TABLE IF NOT EXISTS category_table (
                    category_id   INT AUTO_INCREMENT PRIMARY KEY,
                    category_name VARCHAR(100) NOT NULL,
                    parent_id     INT NULL,
                    FOREIGN KEY (parent_id) REFERENCES category_table(category_id)
                )`,
            },
            {
                name: 'product_table',
                sql: `CREATE TABLE IF NOT EXISTS product_table (
                    product_id   INT AUTO_INCREMENT PRIMARY KEY,
                    store_id     INT NOT NULL,
                    category_id  INT NOT NULL,
                    product_name VARCHAR(150) NOT NULL,
                    description  TEXT,
                    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (store_id)    REFERENCES store_table(store_id),
                    FOREIGN KEY (category_id) REFERENCES category_table(category_id)
                )`,
            },
            {
                name: 'cart_table',
                sql: `CREATE TABLE IF NOT EXISTS cart_table (
                    cart_id    INT AUTO_INCREMENT PRIMARY KEY,
                    profile_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
                )`,
            },
            {
                name: 'order_table',
                sql: `CREATE TABLE IF NOT EXISTS order_table (
                    order_id     INT AUTO_INCREMENT PRIMARY KEY,
                    buyer_id     INT NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status       ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
                    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (buyer_id) REFERENCES profile_table(profile_id)
                )`,
            },
            {
                name: 'payment_table',
                sql: `CREATE TABLE IF NOT EXISTS payment_table (
                    payment_id     INT AUTO_INCREMENT PRIMARY KEY,
                    order_id       INT NOT NULL,
                    payment_method VARCHAR(50),
                    payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
                    paid_at        TIMESTAMP NULL,
                    FOREIGN KEY (order_id) REFERENCES order_table(order_id)
                )`,
            },
            {
                name: 'shipment_table',
                sql: `CREATE TABLE IF NOT EXISTS shipment_table (
                    shipment_id     INT AUTO_INCREMENT PRIMARY KEY,
                    order_id        INT NOT NULL,
                    courier         VARCHAR(50),
                    tracking_number VARCHAR(100),
                    status          ENUM('pending','shipped','delivered') DEFAULT 'pending',
                    FOREIGN KEY (order_id) REFERENCES order_table(order_id)
                )`,
            },
            {
                name: 'review_table',
                sql: `CREATE TABLE IF NOT EXISTS review_table (
                    review_id  INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    profile_id INT NOT NULL,
                    rating     INT,
                    comment    TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES product_table(product_id),
                    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
                )`,
            },
        ];

        console.log('🏗️  Creating tables...');
        for (const { name, sql } of tables) {
            process.stdout.write(`  ├─ ${name}... `);
            await pool.query(sql);
            console.log('✓');
        }

        // ── Step 4: Verify ─────────────────────────────────────────────────
        const [rows] = await pool.query('SHOW TABLES');
        console.log(`\n📋 Tables in '${DB_NAME}':`);
        rows.forEach(row => console.log(`  └─ ${Object.values(row)[0]}`));

        console.log('\n✅ Setup complete! Update your .env.local:');
        console.log(`   TIDB_DATABASE=${DB_NAME}\n`);

    } catch (err) {
        console.error('\n❌ Setup failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
