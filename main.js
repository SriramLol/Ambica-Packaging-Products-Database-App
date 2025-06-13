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

  // Create tables if not already present
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      stock INTEGER DEFAULT 0,
      price REAL
    );
  `);

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

  db.run(`
    CREATE TABLE IF NOT EXISTS gum (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      amount INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS wire (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount INTEGER
    );
  `);

  fs.writeFileSync(dbPath, Buffer.from(db.export()));
  createWindow();
});

// ========== IPC HANDLERS ==========

ipcMain.on('add-reel', (event, data) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    db.run(`
      INSERT INTO reels (date, company, size, gsm, bf, weight, amount, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      data.date, data.company, data.size, data.gsm,
      data.bf, data.weight, data.amount, data.type
    ]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    event.sender.send('get-reels');
  });
});

ipcMain.on('get-reels', (event) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    const result = db.exec(`
      SELECT date, company, size, gsm, bf, weight, amount, type
      FROM reels ORDER BY date DESC;
    `);
    const rows = result[0]?.values.map(row => ({
      date: row[0], company: row[1], size: row[2],
      gsm: row[3], bf: row[4], weight: row[5],
      amount: row[6], type: row[7]
    })) || [];
    event.sender.send('reels-data', rows);
  });
});

ipcMain.on('add-gum', (event, data) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    db.run(`
      INSERT INTO gum (type, amount) VALUES (?, ?);
    `, [data.type, data.amount]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    event.sender.send('get-gum');
  });
});

ipcMain.on('get-gum', (event) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    const result = db.exec(`SELECT type, amount FROM gum;`);
    const rows = result[0]?.values.map(row => ({
      type: row[0], amount: row[1]
    })) || [];
    event.sender.send('gum-data', rows);
  });
});

ipcMain.on('add-wire', (event, data) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    db.run(`INSERT INTO wire (amount) VALUES (?);`, [data.amount]);
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    event.sender.send('get-wire');
  });
});

ipcMain.on('get-wire', (event) => {
  initSqlJs().then(SQL => {
    const db = new SQL.Database(fs.readFileSync(dbPath));
    const result = db.exec(`SELECT amount FROM wire;`);
    const rows = result[0]?.values.map(row => ({ amount: row[0] })) || [];
    event.sender.send('wire-data', rows);
  });
});
