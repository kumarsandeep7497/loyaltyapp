const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// 1. Connect to the database
const db = new sqlite3.Database('./loyalty.db');

// 2. Initialize the table structure
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS customers (email TEXT PRIMARY KEY, current_stamps INTEGER DEFAULT 0)");
    console.log("Database initialized and ready.");
});

// 3. The main Stamp Logic
app.post('/add-stamp', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send("No email provided");

    const cleanEmail = email.toLowerCase().trim();

    db.get("SELECT current_stamps FROM customers WHERE email = ?", [cleanEmail], (err, row) => {
        if (err) return res.status(500).send("Database Error");

        if (row) {
            const newCount = row.current_stamps + 1;

            if (newCount >= 10) {
                // RESET LOGIC: Set stamps to 0 because they earned the reward
                db.run("UPDATE customers SET current_stamps = 0 WHERE email = ?", [cleanEmail], (err) => {
                    res.send(`REWARD EARNED! 🏆\nTotal: 10 Stamps!\n\nStamps have been reset to 0.\nCustomer can start earning again!`);
                });
            } else {
                // NORMAL UPDATE: Just add 1
                db.run("UPDATE customers SET current_stamps = ? WHERE email = ?", [newCount, cleanEmail], (err) => {
                    res.send(`Stamp Added! ✅\nCustomer: ${cleanEmail}\nTotal Stamps: ${newCount}`);
                });
            }
        } else {
            // NEW USER
            db.run("INSERT INTO customers (email, current_stamps) VALUES (?, 1)", [cleanEmail], (err) => {
                res.send(`Welcome! First Stamp Added. ✅\nTotal: 1`);
            });
        }
    });
});

// Route to get all customer data for the Merchant Dashboard
app.get('/dashboard-data', (req, res) => {
    db.all("SELECT email, current_stamps FROM customers ORDER BY current_stamps DESC", [], (err, rows) => {
        if (err) {
            res.status(500).send("Error fetching data");
            return;
        }
        res.json(rows); // Sends the list as JSON
    });
});

const PORT = process.env.PORT || 3000; // Use the provider's port or 3000
app.listen(PORT, () => {
    console.log(`Service running on port ${PORT}`);
});