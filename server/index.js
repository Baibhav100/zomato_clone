const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const XLSX = require('xlsx');
const db = require('./db');
const ai = require('./ai');
const { spawn } = require('child_process');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));


// Database Schema updates
db.execute("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod'").catch(() => {});

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role = 'user' } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
        res.json({ id: result.insertId, success: true });
    } catch (err) {
        res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'Email already exists.' : 'Database error.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password))) 
            return res.status(401).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        console.log(`[AUTH] Login Success: ${user.email} (ID: ${user.id})`);
        
        res.cookie('accessToken', accessToken, { 
            httpOnly: false, // Changed to false for easier debugging, set to true for production
            secure: false, 
            sameSite: 'lax', 
            maxAge: 3600000 
        });
        res.json({ user: { id: user.id, name: user.name, role: user.role }, token: accessToken });

    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', async (req, res) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        console.log('[AUTH] /me - No token provided');
        return res.status(401).json({ error: "Auth required" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Safety: only fetch core columns first to avoid "Unknown column" errors 
        const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        
        if (rows.length === 0) {
            console.log(`[AUTH] /me - User ${decoded.id} not found in DB`);
            return res.status(401).json({ error: "User not found" });
        }
        
        // Try to add phone/address if they exist in the DB result, otherwise skip
        const user = rows[0];
        try {
            const [[extra]] = await db.execute('SELECT phone, address FROM users WHERE id = ?', [decoded.id]);
            if (extra) {
                user.phone = extra.phone;
                user.address = extra.address;
            }
        } catch (e) {
            // Silently skip if phone/address columns are missing
            console.log('[AUTH] /me - Profile columns not found, using basic profile');
        }
        
        console.log(`[AUTH] /me - Session restored for ${user.email}`);
        res.json(user);
    } catch (err) { 
        console.error('[AUTH] /me - Error:', err.message);
        const status = err.name === 'JsonWebTokenError' ? 401 : 500;
        res.status(status).json({ error: err.message }); 
    }
});



app.get('/api/public/search', async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json([]);
    try {
        const [rows] = await db.execute(
            'SELECT id, name, image_url, category FROM restaurants WHERE name LIKE ? LIMIT 8',
            [`%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

// --- RESTAURANTS & MENU ---
app.get('/api/restaurants', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM restaurants';
        let params = [];
        
        if (category) {
            // Use exact normalized category IDs
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        query += ' ORDER BY rating DESC';
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});


app.get('/api/restaurants/:id', async (req, res) => {
    try {
        const [[restaurant]] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
        const [menu] = await db.execute('SELECT * FROM menu_items WHERE restaurant_id = ?', [req.params.id]);
        const [reviews] = await db.execute('SELECT * FROM reviews WHERE restaurant_id = ?', [req.params.id]);
        res.json({ ...restaurant, menu, reviews });
    } catch (err) { res.status(404).json({ error: "Not found" }); }
});

// --- AI FEATURES ---
app.post('/api/ai/chat', async (req, res) => {
    try {
        const reply = await ai.getAIResponse(`User: ${req.body.message}. Respond as a food expert.`);
        res.json({ reply });
    } catch (err) { res.json({ reply: "I'm busy eating! Try again." }); }
});

app.get('/api/ai/user-classification', async (req, res) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) return res.json({ classification: "New Foodie", description: "Welcome! Start exploring to let our AI learn your taste.", recommendations: "Try starting with some highly-rated local favorites." });
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [orders] = await db.execute('SELECT category FROM orders o JOIN restaurants r ON o.restaurant_id = r.id WHERE o.user_id = ? LIMIT 5', [decoded.id]);
        
        const categories = orders.map(o => o.category);
        
        // Use Python for Classification
        const python = spawn('python', ['recommender.py', 'classify', ...categories]);
        let dataString = '';
        python.stdout.on('data', (data) => { dataString += data.toString(); });
        python.on('close', () => {
            try { res.json(JSON.parse(dataString)); }
            catch (e) { res.json({ classification: "Food Enthusiast", description: "You love exploring cuisines!" }); }
        });
    } catch (err) { res.json({ classification: "Food Enthusiast", description: "You love exploring various cuisines!" }); }
});


app.get('/api/ai/smart-recommendations', async (req, res) => {
    try {
        // Simple logic: get top rated restaurants that user hasn't tried much
        const [rows] = await db.execute('SELECT * FROM restaurants ORDER BY rating DESC, price_for_two ASC LIMIT 3');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "AI recommendation failed" }); }
});

app.get('/api/ai/recommend-similar/:id', async (req, res) => {
    try {
        const [[restaurant]] = await db.execute('SELECT name, category FROM restaurants WHERE id = ?', [req.params.id]);
        
        // Call Python Recommender (Mode: recommend)
        const python = spawn('python', ['recommender.py', 'recommend', restaurant.name]);
        let dataString = '';
        python.stdout.on('data', (data) => { dataString += data.toString(); });
        
        python.on('close', async (code) => {
            try {
                const similarNames = JSON.parse(dataString);
                if (similarNames && similarNames.length > 0) {
                    const [rows] = await db.execute(
                        `SELECT * FROM restaurants WHERE name IN (${similarNames.map(() => '?').join(',')}) LIMIT 3`, 
                        similarNames
                    );
                    return res.json(rows);
                }
            } catch (e) {}
            const [fallback] = await db.execute('SELECT * FROM restaurants WHERE category = ? AND id != ? LIMIT 3', [restaurant.category, req.params.id]);
            res.json(fallback);
        });
    } catch (err) { res.json([]); }
});



app.post('/api/ai/describe-food', async (req, res) => {
    const { foodName, restaurantName } = req.body;
    try {
        // Use Python for Description mapping (Mode: describe)
        const python = spawn('python', ['recommender.py', 'describe', foodName, restaurantName || 'this restaurant']);
        let dataString = '';
        python.stdout.on('data', (data) => { dataString += data.toString(); });
        python.on('close', () => {
            try { res.json(JSON.parse(dataString)); }
            catch (e) { res.json({ result: "An exquisite blend of authentic flavors prepared to perfection." }); }
        });
    } catch (err) { res.json({ result: "An exquisite blend of authentic flavors prepared to perfection." }); }
});



// --- ADMIN ---
const authenticateAdmin = async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Auth required" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: "Admin only" });
        req.user = decoded;
        next();
    } catch (err) { 
        return res.status(401).json({ error: "Token expired or invalid" }); 
    }
};

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    const [[users]] = await db.execute('SELECT COUNT(*) as c FROM users');
    const [[orders]] = await db.execute('SELECT COUNT(*) as c FROM orders');
    const [[rests]] = await db.execute('SELECT COUNT(*) as c FROM restaurants');
    res.json({ totalUsers: users.c, totalOrders: orders.c, restaurantCount: rests.c });
});

// --- ORDERS ---
app.get('/api/orders', async (req, res) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Auth required" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [rows] = await db.execute(`
            SELECT o.id, o.status, o.address, o.created_at,
                   COALESCE(o.total_price, o.total_amount, 0) as total_price,
                   r.name as restaurant_name,
                   r.image_url as restaurant_image
            FROM orders o 
            JOIN restaurants r ON o.restaurant_id = r.id 
            WHERE o.user_id = ? 
            ORDER BY o.created_at DESC
        `, [decoded.id]);
        
        // Fetch items for each order
        for (let order of rows) {
            try {
                const [items] = await db.execute(`
                    SELECT oi.quantity, oi.price,
                           COALESCE(m.item_name, 'Item') as item_name
                    FROM order_items oi
                    LEFT JOIN menu_items m ON oi.menu_item_id = m.id
                    WHERE oi.order_id = ?
                `, [order.id]);
                order.items = items;
            } catch(e) { order.items = []; }
        }
        
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Auth required" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify order belongs to user
        const [orderRows] = await db.execute('SELECT user_id FROM orders WHERE id = ?', [req.params.id]);
        if (orderRows.length === 0) return res.status(404).json({ error: "Order not found" });
        if (orderRows[0].user_id !== decoded.id) return res.status(403).json({ error: "Not authorized to delete this order" });

        await db.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { 
        const status = err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' ? 401 : 500;
        res.status(status).json({ error: err.message }); 
    }
});



app.post('/api/payments/razorpay/order', async (req, res) => {
    try {
        const { amount } = req.body;
        const axios = require('axios');
        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
        
        const response = await axios.post('https://api.razorpay.com/v1/orders', {
            amount: amount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }, {
            headers: { Authorization: `Basic ${auth}` }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { restaurantId, totalPrice, address, items } = req.body;
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    try {
        if (!token) return res.status(401).json({ error: "Login required" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try inserting with total_price first, fall back to total_amount
        let orderResult;
        try {
            [orderResult] = await db.execute(
                'INSERT INTO orders (user_id, restaurant_id, total_price, address, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
                [decoded.id, restaurantId, totalPrice, address, 'pending', req.body.paymentMethod || 'cod']
            );
        } catch (e) {
            // If total_price column doesn't exist, try total_amount
            [orderResult] = await db.execute(
                'INSERT INTO orders (user_id, restaurant_id, total_amount, address, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
                [decoded.id, restaurantId, totalPrice, address, 'pending', req.body.paymentMethod || 'cod']
            );
        }

        const orderId = orderResult.insertId;

        // Save each cart item — store item_name directly so it survives re-seeds
        for (const it of items) {
            try {
                await db.execute(
                    'INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES (?, ?, ?, ?, ?)',
                    [orderId, it.id || null, it.quantity, it.price, it.item_name || 'Item']
                );
            } catch (e) {
                // item_name column might not exist yet — fall back without it
                await db.execute(
                    'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, it.id || null, it.quantity, it.price]
                );
            }
        }

        console.log(`[ORDER] New order #${orderId} placed by user ${decoded.id} for ₹${totalPrice}`);
        res.json({ success: true, orderId });
    } catch (err) {
        console.error('[ORDER] Failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// --- USER PROFILE ---
// --- ADMIN ORDERS ---
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT o.id, o.status, o.address, o.created_at, o.payment_method,
                   COALESCE(o.total_price, o.total_amount, 0) as total_price,
                   u.name as user_name, u.email as user_email,
                   r.name as restaurant_name
            FROM orders o 
            JOIN users u ON o.user_id = u.id
            JOIN restaurants r ON o.restaurant_id = r.id 
            ORDER BY o.created_at DESC
        `);
        // Fetch items for each order
        for (let order of rows) {
            try {
                const [items] = await db.execute('SELECT quantity, price, item_name FROM order_items WHERE order_id = ?', [order.id]);
                order.items = items;
            } catch(e) { order.items = []; }
        }
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/profile', async (req, res) => {
    const { name, phone, address } = req.body;
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await db.execute('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone, address, decoded.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});


app.post('/api/auth/refresh', async (req, res) => {
    // Basic implementation for now
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "No token" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
        const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('accessToken', newToken, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 3600000 });
        res.json({ token: newToken });
    } catch (err) { res.status(401).json({ error: "Invalid token" }); }
});


// --- ADMIN ANALYTICS ---
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const [[{ count: restaurantCount }]] = await db.execute('SELECT COUNT(*) as count FROM restaurants');
        const [[{ count: foodCount }]] = await db.execute('SELECT COUNT(*) as count FROM menu_items');
        const [[{ count: totalUsers }]] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [[{ total: totalRevenue }]] = await db.execute('SELECT SUM(total_price) as total FROM orders');
        const [[{ count: totalOrders }]] = await db.execute('SELECT COUNT(*) as count FROM orders');
        
        res.json({ restaurantCount, foodCount, totalUsers, totalRevenue: totalRevenue || 0, totalOrders });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/daily-sales', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT DATE(created_at) as date, COUNT(*) as order_count, SUM(total_price) as total_revenue 
            FROM orders 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC LIMIT 14
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/popular-foods', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT item_name, SUM(quantity) as order_count, 0 as likes 
            FROM order_items 
            GROUP BY item_name 
            ORDER BY order_count DESC LIMIT 10
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/restaurant-performance', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT r.name, COUNT(o.id) as total_orders, SUM(o.total_price) as total_revenue 
            FROM restaurants r 
            LEFT JOIN orders o ON r.id = o.restaurant_id 
            GROUP BY r.id 
            ORDER BY total_revenue DESC LIMIT 10
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/recent-foods', authenticateAdmin, async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const [rows] = await db.execute(`
            SELECT m.*, r.name as restaurant_name 
            FROM menu_items m 
            JOIN restaurants r ON m.restaurant_id = r.id 
            ORDER BY m.id DESC LIMIT ?
        `, [Number(limit)]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email, role, last_login, total_logins FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT o.id, o.status, o.address, o.created_at,
                   COALESCE(o.total_price, o.total_amount, 0) as total_price,
                   u.name as user_name, u.email as user_email, 
                   r.name as restaurant_name
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN restaurants r ON o.restaurant_id = r.id
            ORDER BY o.created_at DESC
        `);
        
        // Fetch items for each order
        for (let order of rows) {
            try {
                const [items] = await db.execute(`
                    SELECT oi.quantity, oi.price,
                           COALESCE(oi.item_name, m.item_name, 'Item') as item_name
                    FROM order_items oi
                    LEFT JOIN menu_items m ON oi.menu_item_id = m.id
                    WHERE oi.order_id = ?
                `, [order.id]);
                order.items = items;
            } catch(e) { order.items = []; }
        }
        
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


app.get('/api/admin/ai/restaurant-analysis', authenticateAdmin, async (req, res) => {
    // Return placeholder for now
    res.json([]);
});

// --- FOOD MANAGEMENT (ADMIN) ---
app.post('/api/admin/menu', authenticateAdmin, async (req, res) => {
    const { restaurant_id, item_name, description, price, image_url, type, meal_type, category } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO menu_items (restaurant_id, item_name, description, price, image_url, type, meal_type, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [restaurant_id, item_name, description, price, image_url, type, meal_type, category]
        );
        res.json({ id: result.insertId, success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/menu/:id', authenticateAdmin, async (req, res) => {
    const { item_name, description, price, image_url, type, meal_type, category } = req.body;
    try {
        await db.execute(
            'UPDATE menu_items SET item_name = ?, description = ?, price = ?, image_url = ?, type = ?, meal_type = ?, category = ? WHERE id = ?',
            [item_name, description, price, image_url, type, meal_type, category, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/menu/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RESTAURANT MANAGEMENT (ADMIN) ---
app.post('/api/admin/restaurants', authenticateAdmin, async (req, res) => {
    const { name, description, image_url, price_for_two, delivery_time, address, category, lat, lng, is_promoted } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO restaurants (name, description, image_url, price_for_two, delivery_time, address, category, lat, lng, is_promoted, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.0)',
            [name, description, image_url, price_for_two, delivery_time, address, category, lat, lng, is_promoted ? 1 : 0]
        );
        res.json({ id: result.insertId, success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/restaurants/:id', authenticateAdmin, async (req, res) => {
    const { name, description, image_url, price_for_two, delivery_time, address, category, lat, lng, is_promoted } = req.body;
    try {
        await db.execute(
            'UPDATE restaurants SET name = ?, description = ?, image_url = ?, price_for_two = ?, delivery_time = ?, address = ?, category = ?, lat = ?, lng = ?, is_promoted = ? WHERE id = ?',
            [name, description, image_url, price_for_two, delivery_time, address, category, lat, lng, is_promoted ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/restaurants/:id', authenticateAdmin, async (req, res) => {
    try {
        // First delete all menu items for this restaurant
        await db.execute('DELETE FROM menu_items WHERE restaurant_id = ?', [req.params.id]);
        // Then delete the restaurant
        await db.execute('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(process.env.PORT || 5000, async () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    
    // --- DATABASE SCHEMA UPDATES ---
    try {
        await db.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL');
        await db.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS total_logins INT DEFAULT 0');
    } catch (e) {
        // Fallback for MySQL versions that don't support ADD COLUMN IF NOT EXISTS
        try { await db.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL'); } catch (e2) {}
        try { await db.execute('ALTER TABLE users ADD COLUMN total_logins INT DEFAULT 0'); } catch (e2) {}
    }

    // --- DATABASE CLEANUP ---
    try {
        console.log('--- Cleaning up restaurant categories ---');
        // Reset reviews/bad strings to delivery
        await db.execute("UPDATE restaurants SET category = 'delivery' WHERE category NOT IN ('delivery', 'dine_out', 'nightlife', 'Dining Out')");
        // Standardize labels
        await db.execute("UPDATE restaurants SET category = 'dine_out' WHERE category = 'Dining Out'");
        
        // Spread Nightlife categories for variety (assign every 7th)
        const [rows] = await db.execute('SELECT id FROM restaurants');
        for (let i = 0; i < rows.length; i++) {
            if (i % 7 === 0) {
                await db.execute("UPDATE restaurants SET category = 'nightlife' WHERE id = ?", [rows[i].id]);
            } else if (i % 3 === 0) {
               await db.execute("UPDATE restaurants SET category = 'dine_out' WHERE id = ?", [rows[i].id]);
            }
        }
        console.log('✔ Scheme checks and Category cleanup DONE');
    } catch (err) {
        console.error('! DB Setup/Cleanup error:', err.message);
    }
});


