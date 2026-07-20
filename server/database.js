import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'leads.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Veritabanına bağlanılamadı:', err.message);
  } else {
    console.log('SQLite veritabanına bağlanıldı.');
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        message TEXT,
        date TEXT NOT NULL
      )
    `, () => {
      // Add status column safely if it doesn't exist
      db.run("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'Yeni'", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding status column:', err.message);
        }
      });
      // Add notes column safely if it doesn't exist
      db.run("ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT ''", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding notes column:', err.message);
        }
      });
    });
  }
});

export default db;
