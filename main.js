const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

let mainWindow;
const dbPath = path.join(__dirname, 'data', 'inventory.sqlite');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

ipcMain.on('navigate', (event, page) => {
  const pageMap = {
    inventory: 'inventory.html',
    orders: 'orders.html'
  };

  const targetFile = pageMap[page];
  if (targetFile) {
    mainWindow.loadFile(path.join(__dirname, targetFile));
  }
});

app.whenReady().then(async () => {
  const SQL = await initSqlJs();

  if (!fs.existsSync('data')) fs.mkdirSync('data');

  const dbExists = fs.existsSync(dbPath);
  const db = dbExists
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();

  // Ensure products table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      stock INTEGER DEFAULT 0,
      price REAL
    );
  `);

  // Ensure reels table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS reels (
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

  // Save DB back to disk
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  console.log(dbExists ? '📂 Loaded and updated existing database.' : '💾 Created new database.');

  createWindow();
});

// Handle adding a reel
ipcMain.on('add-reel', (event, data) => {
  initSqlJs().then(SQL => {
    const dbBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(dbBuffer);

    db.run(`
      INSERT INTO reels (date, company, size, gsm, bf, weight, amount, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      data.date,
      data.company,
      data.size,
      data.gsm,
      data.bf,
      data.weight,
      data.amount,
      data.type
    ]);

    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    event.sender.send('get-reels');
  });
});

// Handle fetching reels
ipcMain.on('get-reels', (event) => {
  initSqlJs().then(SQL => {
    const dbBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(dbBuffer);

    try {
      const results = db.exec(`
        SELECT date, company, size, gsm, bf, weight, amount, type 
        FROM reels 
        ORDER BY date DESC;
      `);

      const rows = results[0]?.values.map(row => ({
        date: row[0],
        company: row[1],
        size: row[2],
        gsm: row[3],
        bf: row[4],
        weight: row[5],
        amount: row[6],
        type: row[7]
      })) || [];

      event.sender.send('reels-data', rows);
    } catch (err) {
      console.error('Error reading reels:', err.message);
      event.sender.send('reels-data', []);
    }
  });
});
