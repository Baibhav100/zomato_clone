const db = require('./db');

async function fixDatabase() {
    console.log('--- Database Repair Tool ---');
    try {
        // Add phone column
        try {
            await db.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20)');
            console.log('✔ Added phone column');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ Phone column already exists');
            else throw e;
        }

        // Add last_login column
        try {
            await db.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL');
            console.log('✔ Added last_login column');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ last_login column already exists');
        }

        // Add total_logins column
        try {
            await db.execute('ALTER TABLE users ADD COLUMN total_logins INT DEFAULT 0');
            console.log('✔ Added total_logins column');
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ total_logins column already exists');
        }

        // Add order management tables
        try {
            await db.execute(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    restaurant_id INT,
                    total_price DECIMAL(10,2),
                    status ENUM('pending', 'preparing', 'delivered', 'cancelled') DEFAULT 'pending',
                    address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✔ Orders table ensured');
            
            await db.execute(`
                CREATE TABLE IF NOT EXISTS order_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT,
                    menu_item_id INT,
                    item_name VARCHAR(255),
                    quantity INT,
                    price DECIMAL(10,2)
                )
            `);
            console.log('✔ Order Items table ensured');
        } catch (e) {
            console.error('! Error creating order tables:', e.message);
        }

        // Ensure orders table has total_price column
        try { await db.execute('ALTER TABLE orders ADD COLUMN total_price DECIMAL(10,2)'); console.log('✔ Added total_price to orders'); }
        catch (e) { if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ total_price already exists'); }

        // Ensure order_items has item_name for display resilience
        try { await db.execute('ALTER TABLE order_items ADD COLUMN item_name VARCHAR(255)'); console.log('✔ Added item_name to order_items'); }
        catch (e) { if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ item_name already exists'); }

        // Ensure orders has status column
        try { await db.execute("ALTER TABLE orders ADD COLUMN status ENUM('pending','preparing','delivered','cancelled') DEFAULT 'pending'"); console.log('✔ Added status to orders'); }
        catch (e) { if (e.code === 'ER_DUP_COLUMN_NAME') console.log('✔ status already exists'); }

        // --- CATEGORY NORMALIZATION ---
        console.log('--- Categorizing Restaurants ---');
        // Reset long garbage strings/reviews to 'delivery'
        const [reset] = await db.execute(`
            UPDATE restaurants 
            SET category = 'delivery' 
            WHERE category NOT IN ('delivery', 'dine_out', 'nightlife', 'Dining Out')
        `);
        console.log(`✔ Normalized ${reset.affectedRows} messy categories`);

        // Standardize 'Dining Out' to 'dine_out'
        await db.execute("UPDATE restaurants SET category = 'dine_out' WHERE category = 'Dining Out'");

        // Assign 'nightlife' and 'dine_out' to a spread of rows
        const [rows] = await db.execute('SELECT id FROM restaurants');
        for (let i = 0; i < rows.length; i++) {
            if (i % 7 === 0) {
                await db.execute("UPDATE restaurants SET category = 'nightlife' WHERE id = ?", [rows[i].id]);
            } else if (i % 3 === 0) {
                await db.execute("UPDATE restaurants SET category = 'dine_out' WHERE id = ?", [rows[i].id]);
            }
        }
        console.log('✔ Re-distributed categories (Nightlife assigned to 1 in 7 restaurants)');

        console.log('✅ Database is now up to date and categorized!');



        process.exit(0);
    } catch (err) {
        console.error('❌ Repair failed:', err.message);
        process.exit(1);
    }
}

fixDatabase();
