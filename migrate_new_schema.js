// migrate_new_schema.js
// Applies new_schema.md tables to the existing TiDB database.
// Safe to re-run — all statements use IF NOT EXISTS.

const mysql = require('mysql2/promise');

const DB_NAME = process.env.TIDB_DATABASE || 'ecommerce_db';

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
        console.log(`\n🔗 Connected to database '${DB_NAME}'`);

        // ── Step 1: New tables to create ──────────────────────────────────────
        const migrations = [
            // ── Core tables (ensure they exist with correct structure) ─────────
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
                    username      VARCHAR(50) UNIQUE,
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

            // ── NEW: Product Variants ─────────────────────────────────────────
            {
                name: 'product_variant_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS product_variant_table (
                    variant_id   INT AUTO_INCREMENT PRIMARY KEY,
                    product_id   INT NOT NULL,
                    variant_name VARCHAR(100),
                    sku          VARCHAR(100),
                    price        DECIMAL(10,2) NOT NULL,
                    stock        INT NOT NULL,
                    FOREIGN KEY (product_id) REFERENCES product_table(product_id)
                )`,
            },

            // ── NEW: Product Images ───────────────────────────────────────────
            {
                name: 'product_image_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS product_image_table (
                    image_id   INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    image_url  TEXT NOT NULL,
                    FOREIGN KEY (product_id) REFERENCES product_table(product_id)
                )`,
            },

            // ── Cart (base table) ─────────────────────────────────────────────
            {
                name: 'cart_table',
                sql: `CREATE TABLE IF NOT EXISTS cart_table (
                    cart_id    INT AUTO_INCREMENT PRIMARY KEY,
                    profile_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
                )`,
            },

            // ── NEW: Cart Items ───────────────────────────────────────────────
            {
                name: 'cart_item_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS cart_item_table (
                    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
                    cart_id      INT NOT NULL,
                    variant_id   INT NOT NULL,
                    quantity     INT NOT NULL,
                    FOREIGN KEY (cart_id)    REFERENCES cart_table(cart_id),
                    FOREIGN KEY (variant_id) REFERENCES product_variant_table(variant_id)
                )`,
            },

            // ── Order (base table) ────────────────────────────────────────────
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

            // ── NEW: Order Items ──────────────────────────────────────────────
            {
                name: 'order_item_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS order_item_table (
                    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id      INT NOT NULL,
                    variant_id    INT NOT NULL,
                    quantity      INT NOT NULL,
                    price         DECIMAL(10,2) NOT NULL,
                    FOREIGN KEY (order_id)   REFERENCES order_table(order_id),
                    FOREIGN KEY (variant_id) REFERENCES product_variant_table(variant_id)
                )`,
            },

            // ── Payment ───────────────────────────────────────────────────────
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

            // ── NEW: Addresses ────────────────────────────────────────────────
            {
                name: 'address_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS address_table (
                    address_id   INT AUTO_INCREMENT PRIMARY KEY,
                    profile_id   INT NOT NULL,
                    full_address TEXT NOT NULL,
                    city         VARCHAR(100),
                    postal_code  VARCHAR(20),
                    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
                )`,
            },

            // ── Shipment (now includes address_id FK) ─────────────────────────
            {
                name: 'shipment_table',
                sql: `CREATE TABLE IF NOT EXISTS shipment_table (
                    shipment_id     INT AUTO_INCREMENT PRIMARY KEY,
                    order_id        INT NOT NULL,
                    address_id      INT NOT NULL,
                    courier         VARCHAR(50),
                    tracking_number VARCHAR(100),
                    status          ENUM('pending','shipped','delivered') DEFAULT 'pending',
                    shipped_at      TIMESTAMP NULL,
                    delivered_at    TIMESTAMP NULL,
                    FOREIGN KEY (order_id)   REFERENCES order_table(order_id),
                    FOREIGN KEY (address_id) REFERENCES address_table(address_id)
                )`,
            },

            // ── Review ────────────────────────────────────────────────────────
            {
                name: 'review_table',
                sql: `CREATE TABLE IF NOT EXISTS review_table (
                    review_id  INT AUTO_INCREMENT PRIMARY KEY,
                    product_id INT NOT NULL,
                    profile_id INT NOT NULL,
                    rating     INT CHECK (rating BETWEEN 1 AND 5),
                    comment    TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES product_table(product_id),
                    FOREIGN KEY (profile_id) REFERENCES profile_table(profile_id)
                )`,
            },

            // ── NEW: Vouchers ─────────────────────────────────────────────────
            {
                name: 'voucher_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS voucher_table (
                    voucher_id     INT AUTO_INCREMENT PRIMARY KEY,
                    code           VARCHAR(50) UNIQUE,
                    discount_type  ENUM('percent','fixed'),
                    discount_value DECIMAL(10,2),
                    min_purchase   DECIMAL(10,2),
                    start_date     DATETIME,
                    end_date       DATETIME
                )`,
            },

            // ── NEW: Order Vouchers ───────────────────────────────────────────
            {
                name: 'order_voucher_table (NEW)',
                sql: `CREATE TABLE IF NOT EXISTS order_voucher_table (
                    order_voucher_id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id         INT NOT NULL,
                    voucher_id       INT NOT NULL,
                    discount_amount  DECIMAL(10,2),
                    FOREIGN KEY (order_id)   REFERENCES order_table(order_id),
                    FOREIGN KEY (voucher_id) REFERENCES voucher_table(voucher_id)
                )`,
            },
        ];

        // ── Step 2: Run all migrations ─────────────────────────────────────────
        console.log('\n🏗️  Applying schema migrations...\n');
        for (const { name, sql } of migrations) {
            const isNew = name.includes('(NEW)');
            process.stdout.write(`  ${isNew ? '🆕' : '✔️ '} ${name}... `);
            try {
                await pool.query(sql);
                console.log('✓');
            } catch (err) {
                console.log(`\n  ⚠️  Warning for ${name}: ${err.message}`);
            }
        }

        // ── Step 3: Verify final table list ───────────────────────────────────
        const [rows] = await pool.query('SHOW TABLES');
        console.log(`\n📋 Tables now in '${DB_NAME}':`);
        rows.forEach(row => console.log(`  └─ ${Object.values(row)[0]}`));

        console.log('\n✅ Migration complete!\n');

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
