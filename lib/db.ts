import Database from 'better-sqlite3';

const globalForDb = globalThis as unknown as { db: Database.Database };

export const db = globalForDb.db || new Database('forensilock.db');

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT,
    mfa_secret TEXT
  );
  CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description_enc TEXT,
    iv TEXT,
    hash TEXT,
    submitted_by TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);