// 1. We tell the computer to use the SQLite tool we installed
const sqlite3 = require('sqlite3').verbose();

// 2. We create the actual database file. It will be named 'loyalty.db'
const db = new sqlite3.Database('./loyalty.db');

db.serialize(() => {
  // 3. This part creates a list for the SHOPS (Gyms, Cafes, etc.)
  // 'target_stamps' is how many stamps they need to get a reward
  db.run(`CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_name TEXT,
    target_stamps INTEGER
  )`);

  // 4. This part creates a list for the CUSTOMERS
  // We save their email and how many stamps they currently have
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    email TEXT PRIMARY KEY,
    shop_id INTEGER,
    current_stamps INTEGER DEFAULT 0
  )`);

  console.log("------------------------------------------");
  console.log("SUCCESS: Your Berlin Database is Created!");
  console.log("------------------------------------------");
});

// Close the connection to the file
db.close();