const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const CSV_FILE = path.join(__dirname, 'data', 'zomato.csv');
const MAX_RESTAURANTS = 500;

const restaurantImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
];

const foodImages = [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=80'
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function parseCsvLine(line) {
    const result = [];
    let cur = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(cur.trim()); cur = ""; }
        else cur += char;
    }
    result.push(cur.trim());
    return result;
}

async function runSeed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'zomato_clone',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('🚀 CLEANING DATABASE...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE order_items');
        await connection.execute('TRUNCATE TABLE orders');
        await connection.execute('TRUNCATE TABLE menu_items');
        await connection.execute('TRUNCATE TABLE restaurants');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('📦 IMPORTING AUTHENTIC DATA FROM CSV...');
        const fileStream = fs.createReadStream(CSV_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let count = 0; let header = null;
        for await (const line of rl) {
            if (!header) { header = parseCsvLine(line); continue; }
            const data = parseCsvLine(line);
            if (data.length < 10 || !data[2]) continue;

            // Clean restaurant name — strip any noise
            const name = data[2].replace(/["']/g, '').trim();
            if (!name || name.length > 200) continue;

            const address = (data[1] || 'Guwahati').trim().substring(0, 200);
            const ratingRaw = parseFloat(data[5]);
            const rating = (!isNaN(ratingRaw) && ratingRaw > 0 && ratingRaw <= 5) ? ratingRaw : parseFloat((Math.random() * 2 + 3).toFixed(1));
            
            // Price for two — only numeric
            const priceRaw = data[12] ? data[12].replace(/[^\d]/g, '') : '';
            const price = (priceRaw && parseInt(priceRaw) > 0) ? parseInt(priceRaw) : Math.floor(Math.random() * 600) + 300;
            
            const category = ['delivery', 'dine_out', 'nightlife'][Math.floor(Math.random() * 3)];
            const cuisines = (data[11] || 'Multi-cuisine').substring(0, 200);
            
            const [resResult] = await connection.execute(
                'INSERT INTO restaurants (name, address, rating, price_for_two, delivery_time, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, address, rating, price, Math.floor(Math.random()*40)+20, category, cuisines, getRandom(restaurantImages)]
            );
            
            const restaurantId = resResult.insertId;
            
            // Menu parsing — safer split
            let menuData = data[14] || data[10] || '';
            menuData = menuData.replace(/^\[|\]$/g, '').replace(/"/g, '');
            let dishes = menuData.split(/,\s?'?|'\s?,\s?'?/).map(d => d.replace(/^'+|'+$/g, '').trim()).filter(Boolean);
            
            if (dishes.length === 0) dishes = ['Signature Special', 'Chef Choice', 'House Favorite'];

            const uniqueDishes = [...new Set(dishes)].slice(0, 8);
            for (const dishName of uniqueDishes) {
                if (!dishName || dishName.length < 2) continue;
                await connection.execute(
                    'INSERT INTO menu_items (restaurant_id, item_name, description, price, image_url, type, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [restaurantId, dishName.substring(0, 255), `Authentic ${dishName} from ${name}`, Math.floor(Math.random()*400)+150, getRandom(foodImages), Math.random()>0.3?'veg':'non-veg', 'Main Course']
                );
            }
            
            if (++count >= MAX_RESTAURANTS) break;
            if (count % 50 === 0) console.log(`  - Seeded ${count} restaurants...`);
        }


        console.log('👤 CREATING ADMIN USER...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
            'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Super Admin', 'admin@zomato.com', hashedPassword, 'admin']
        );

        console.log('📈 GENERATING SAMPLE ORDERS...');
        const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
        const userId = users[0]?.id || 1;
        const [rests] = await connection.execute('SELECT id FROM restaurants LIMIT 5');
        const [items] = await connection.execute('SELECT id, restaurant_id, price FROM menu_items LIMIT 20');

        for (let i = 0; i < 15; i++) {
            const restaurant = rests[Math.floor(Math.random() * rests.length)];
            const orderItems = items.filter(it => it.restaurant_id === restaurant.id).slice(0, 2);
            if (orderItems.length === 0) continue;

            const total = orderItems.reduce((acc, it) => acc + (it.price * 1), 0);
            const [orderRes] = await connection.execute(
                'INSERT INTO orders (user_id, restaurant_id, total_amount, status) VALUES (?, ?, ?, ?)',
                [userId, restaurant.id, total, 'delivered']
            );
            for (let it of orderItems) {
                await connection.execute('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [orderRes.insertId, it.id, 1, it.price]);
            }
        }

        console.log('✅ ALL SYSTEMS SEEDED SUCCESSFULLY!');
    } catch (err) { console.error('❌ SEED ERROR:', err); }
    finally { await connection.end(); process.exit(0); }
}

runSeed();
