const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./loyalty.db');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Initialize Tables
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, email TEXT, name TEXT, current_stamps INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS shop_settings (id INTEGER PRIMARY KEY, name TEXT, message TEXT, banner_image TEXT)");
    
    // Insert default settings if table is empty
    db.get("SELECT * FROM shop_settings WHERE id = 1", (err, row) => {
        if (!row) {
            db.run("INSERT INTO shop_settings (id, name, message, banner_image) VALUES (1, 'Your Cafe Name', 'Buy 6 coffees, get the 7th free!', '')");
        }
    });
});

// --- API ROUTES ---

// Get Shop Settings
app.get('/api/settings', (req, res) => {
    db.get("SELECT * FROM shop_settings WHERE id = 1", (err, row) => res.json(row));
});

// Update Shop Settings
app.post('/api/settings', (req, res) => {
    const { name, message, banner_image } = req.body;
    db.run("UPDATE shop_settings SET name = ?, message = ?, banner_image = ? WHERE id = 1", 
    [name, message, banner_image], () => res.json({ success: true }));
});

// Add Stamp (Used by Scanner)
app.post('/add-stamp', (req, res) => {
    const { email, name } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    db.get("SELECT * FROM customers WHERE email = ?", [cleanEmail], (err, row) => {
        if (row) {
            let newStamps = row.current_stamps + 1;
            db.run("UPDATE customers SET current_stamps = ? WHERE email = ?", [newStamps, cleanEmail]);
            res.send(`Stamp added! Total: ${newStamps}`);
        } else {
            db.run("INSERT INTO customers (email, name, current_stamps) VALUES (?, ?, 1)", [cleanEmail, name || 'Customer']);
            res.send("Welcome! First stamp added.");
        }
    });
});

// Get Dashboard Data
app.get('/dashboard-data', (req, res) => {
    db.all("SELECT * FROM customers", (err, rows) => res.json(rows));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
