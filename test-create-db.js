const fs = require('fs');
const initSqlJs = require('sql.js');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create and insert into table
  db.run(`
    CREATE TABLE reels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      company TEXT,
      size INTEGER,
      gsm INTEGER,
      bf INTEGER,
      weight REAL,
      amount INTEGER,
      type TEXT
    );
  `);

  db.run(`
    INSERT INTO reels (date, company, size, gsm, bf, weight, amount, type)
    VALUES ('2025-06-12', 'Test Co', 120, 140, 28, 55.5, 10, 'Craft');
  `);

  const dbPath = path.join(__dirname, 'data', 'inventory.sqlite');

  if (!fs.existsSync('data')) fs.mkdirSync('data');

  // Export to disk
  const binary = db.export();
  fs.writeFileSync(dbPath, Buffer.from(binary));

  // Read back and confirm
  const db2 = new SQL.Database(fs.readFileSync(dbPath));
  const result = db2.exec('SELECT * FROM reels;');

  console.log('✅ Final contents of reels table:');
  console.table(result[0]?.values || []);
})();
