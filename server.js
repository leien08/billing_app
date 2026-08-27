const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 連接/建立 SQLite 資料庫
const db = new sqlite3.Database('./electricity.db', (err) => {
  if (err) console.error('資料庫連接失敗:', err);
  else console.log('SQLite 資料庫已成功連接');
});

// 初始化資料庫資料表
db.serialize(() => {
  // 1. 系統設定檔（儲存當前台電單價與總電表）
  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // 2. 套房分電表資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS suite_meters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_name TEXT UNIQUE NOT NULL,
      last_degree REAL DEFAULT 0,
      current_degree REAL DEFAULT 0
    )
  `);

  // 預設資料初始化（若無資料才寫入）
  db.get("SELECT value FROM system_settings WHERE key = 'taipower_rate'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO system_settings (key, value) VALUES ('taipower_rate', '5.0')");
      db.run("INSERT INTO system_settings (key, value) VALUES ('main_last_degree', '1000')");
      db.run("INSERT INTO system_settings (key, value) VALUES ('main_current_degree', '1500')");

      // 預設建立三間套房
      db.run("INSERT INTO suite_meters (room_name, last_degree, current_degree) VALUES ('101室', 100, 250)");
      db.run("INSERT INTO suite_meters (room_name, last_degree, current_degree) VALUES ('102室', 200, 420)");
      db.run("INSERT INTO suite_meters (room_name, last_degree, current_degree) VALUES ('103室', 150, 310)");
    }
  });
});

// API: 讀取所有電費資料 (前台/後台皆可呼叫)
app.get('/api/electricity-data', (req, res) => {
  db.all("SELECT key, value FROM system_settings", [], (err, settingsRows) => {
    if (err) return res.status(500).json({ error: err.message });

    const settings = {};
    settingsRows.forEach(row => { settings[row.key] = parseFloat(row.value) || 0; });

    db.all("SELECT * FROM suite_meters ORDER BY room_name ASC", [], (err, suiteRows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        taipowerRate: settings.taipower_rate || 0,
        mainMeter: {
          lastDegree: settings.main_last_degree || 0,
          currentDegree: settings.main_current_degree || 0
        },
        suites: suiteRows
      });
    });
  });
});

// API: 後台儲存更新資料
app.post('/api/admin/update-electricity', (req, res) => {
  const { taipowerRate, mainMeter, suites } = req.body;

  db.serialize(() => {
    // 更新台電費率與總電表
    db.run("UPDATE system_settings SET value = ? WHERE key = 'taipower_rate'", [taipowerRate]);
    db.run("UPDATE system_settings SET value = ? WHERE key = 'main_last_degree'", [mainMeter.lastDegree]);
    db.run("UPDATE system_settings SET value = ? WHERE key = 'main_current_degree'", [mainMeter.currentDegree]);

    // 更新各套房分電表
    const stmt = db.prepare("UPDATE suite_meters SET last_degree = ?, current_degree = ? WHERE id = ?");
    suites.forEach(suite => {
      stmt.run(suite.last_degree, suite.current_degree, suite.id);
    });
    stmt.finalize();

    res.json({ success: true, message: '資料庫已成功更新！' });
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
