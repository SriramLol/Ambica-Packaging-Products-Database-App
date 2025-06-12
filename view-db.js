const fs = require('fs');
const initSqlJs = require('sql.js');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data', 'inventory.sqlite');

  if (!fs.existsSync(dbPath)) {
    console.log('❌ No database file found.');
    return;
  }

  const dbBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(dbBuffer);

  try {
    const results = db.exec("SELECT * FROM reels;");
    if (results.length === 0) {
      console.log('📭 No data found in reels table.');
    } else {
      const columns = results[0].columns;
      const values = results[0].values;

      console.log('📋 Reels Table:');
      console.table(values.map(row => {
        const obj = {};
        row.forEach((val, i) => obj[columns[i]] = val);
        return obj;
      }));
    }
  } catch (err) {
    console.error('❌ Error reading reels table:', err.message);
  }
})();
