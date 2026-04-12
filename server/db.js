const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zomato_clone',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Helper to get correct order total column name
const getOrderTotalColumn = async () => {
    try {
        const [priceColumn] = await pool.execute("SHOW COLUMNS FROM orders LIKE 'total_price'");
        if (priceColumn.length > 0) return 'total_price';

        const [amountColumn] = await pool.execute("SHOW COLUMNS FROM orders LIKE 'total_amount'");
        if (amountColumn.length > 0) return 'total_amount';

        return 'total_amount'; // Default fallback
    } catch (err) {
        console.error('Column check error:', err.message);
        return 'total_amount';
    }
};

module.exports = {
    pool,
    execute: (...args) => pool.execute(...args),
    getOrderTotalColumn
};
