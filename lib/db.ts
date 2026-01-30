// lib/db.ts
import Database from 'better-sqlite3';

const globalForDb = global as unknown as { db: Database.Database };
export const db = globalForDb.db || new Database('forensilock.db');

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Enable WAL for concurrency
db.pragma('journal_mode = WAL');

// 1. INITIAL SCHEMA (The Base Tables)
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
    description_enc TEXT, iv TEXT, hash TEXT, submitted_by TEXT,
    category TEXT DEFAULT 'general', image_enc TEXT, image_iv TEXT, image_caption TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS case_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, evidence_id INTEGER, author TEXT,
    note_enc TEXT, note_iv TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(evidence_id) REFERENCES evidence(id)
  );

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, action TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. MIGRATION: SECURE NOTEBOOK (Safe to run every time)
try {
  // Try to add the column for the encrypted notebook key
  db.prepare("ALTER TABLE users ADD COLUMN encrypted_notebook_key TEXT").run();
  console.log("MIGRATION: Added 'encrypted_notebook_key' to users.");
} catch (error) {
  // Ignore error if column already exists
}

try {
  // Try to add the column for Public Keys (if you haven't already)
  db.prepare("ALTER TABLE users ADD COLUMN public_key TEXT").run();
  console.log("MIGRATION: Added 'public_key' to users.");
} catch (error) {
  // Ignore error
}

// 3. CREATE PRIVATE NOTES TABLE (Separate Table)
db.exec(`
  CREATE TABLE IF NOT EXISTS private_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner TEXT,
    content_enc TEXT, -- Encrypted with the User's AES Key
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);