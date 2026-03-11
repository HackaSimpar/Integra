import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    expected_admission_date TEXT NOT NULL,
    effective_admission_date TEXT,
    orientation_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Insert default admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('Felipe');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('Felipe', 'Felipe', 'admin');
}

// Insert default settings
const primaryColorExists = db.prepare('SELECT * FROM settings WHERE key = ?').get('primaryColor');
if (!primaryColorExists) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('primaryColor', '#0ea5e9'); // Tailwind sky-500
}

export default db;
