import Database from 'better-sqlite3';

const globalForDb = global as unknown as { db: Database.Database };
export const db = globalForDb.db || new Database('forensilock.db');

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

db.pragma('journal_mode = WAL');

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
    category TEXT DEFAULT 'general',
    
    -- Removed old analysis columns (moved to case_notes table)
    
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- NEW: TABLE FOR MULTIPLE NOTES
  CREATE TABLE IF NOT EXISTS case_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id INTEGER,
    author TEXT,
    note_enc TEXT,
    note_iv TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(evidence_id) REFERENCES evidence(id)
  );

  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);