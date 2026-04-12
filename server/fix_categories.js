const mysql = require('mysql2/promise');

async function fixCategories() {
    const db = await mysql.createConnection({
        host: 'localhost', user: 'root', password: '', database: 'zomato_db'
    });

    console.log('Fixing restaurant categories...');

    // Step 1: Reset all bad categories to 'delivery' (anything not a valid value)
    const [reset] = await db.execute(`
        UPDATE restaurants 
        SET category = 'delivery' 
        WHERE category NOT IN ('delivery', 'dine_out', 'nightlife')
    `);
    console.log(`Reset ${reset.affectedRows} rows with invalid categories to 'delivery'`);

    // Step 2: Get all restaurants to assign dine_out and nightlife to some
    const [all] = await db.execute('SELECT id, name FROM restaurants ORDER BY id ASC');
    console.log(`Total restaurants: ${all.length}`);

    // Assign every 3rd restaurant as dine_out, every 5th as nightlife
    const updates = [];
    for (let i = 0; i < all.length; i++) {
        if (i % 5 === 4) {
            updates.push(db.execute('UPDATE restaurants SET category = ? WHERE id = ?', ['nightlife', all[i].id]));
        } else if (i % 3 === 2) {
            updates.push(db.execute('UPDATE restaurants SET category = ? WHERE id = ?', ['dine_out', all[i].id]));
        }
    }
    await Promise.all(updates);
    console.log(`Assigned dine_out / nightlife to spread of restaurants.`);

    // Step 3: Show final distribution
    const [counts] = await db.execute(`
        SELECT category, COUNT(*) as count FROM restaurants GROUP BY category
    `);
    console.log('Final category distribution:');
    counts.forEach(r => console.log(`  ${r.category}: ${r.count}`));

    await db.end();
    console.log('Done!');
}

fixCategories().catch(console.error);
