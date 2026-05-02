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
        console.log('\n🔄 Migrating data to new normalized tables (Variants & Images)...\n');
        const conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. Fetch all existing products with their price, stock, image_url
        const [products] = await conn.query('SELECT product_id, price, stock, image_url FROM product_table');
        
        for (const p of products) {
            // Only insert variant if one doesn't exist yet
            const [variants] = await conn.query('SELECT variant_id FROM product_variant_table WHERE product_id = ?', [p.product_id]);
            let variant_id;

            if (variants.length === 0) {
                const [varResult] = await conn.query(
                    'INSERT INTO product_variant_table (product_id, variant_name, sku, price, stock) VALUES (?, ?, ?, ?, ?)',
                    [p.product_id, 'Default', `SKU-${p.product_id}`, p.price || 0, p.stock || 0]
                );
                variant_id = varResult.insertId;
                console.log(`  ➕ Created variant for product_id ${p.product_id}`);
            } else {
                variant_id = variants[0].variant_id;
            }

            // Only insert image if one doesn't exist yet and there is an image URL
            if (p.image_url) {
                const [images] = await conn.query('SELECT image_id FROM product_image_table WHERE product_id = ? AND image_url = ?', [p.product_id, p.image_url]);
                if (images.length === 0) {
                    await conn.query(
                        'INSERT INTO product_image_table (product_id, image_url) VALUES (?, ?)',
                        [p.product_id, p.image_url]
                    );
                    console.log(`  ➕ Created image record for product_id ${p.product_id}`);
                }
            }
        }

        await conn.commit();
        conn.release();
        console.log('\n✅ Data migration complete!\n');

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

main();
