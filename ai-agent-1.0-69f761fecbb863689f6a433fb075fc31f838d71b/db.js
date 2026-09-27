import Database from 'better-sqlite3';

// This will create a file named 'reel_record.db' in your root folder
const db = new Database('reel_record.db');
db.pragma('journal_mode = WAL'); // Speeds up SQLite significantly

// Initialize all our tables if they don't exist yet
db.exec(`
  -- Table for our Users
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Table for Watchlists and Favourites
  CREATE TABLE IF NOT EXISTS saved_media (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    media_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    creator TEXT,
    year TEXT,
    genre TEXT,
    duration TEXT,
    rating REAL,
    blurb TEXT,
    vibe TEXT,
    is_watchlist INTEGER DEFAULT 0,
    is_favourite INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, media_id)
  );

  -- Table for the AI Search Cache
  CREATE TABLE IF NOT EXISTS search_cache (
    query_key TEXT PRIMARY KEY,
    results TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const userColumns = db.prepare("PRAGMA table_info(users)").all().map(column => column.name);
if (!userColumns.includes("display_name")) {
  db.exec("ALTER TABLE users ADD COLUMN display_name TEXT");
}
if (!userColumns.includes("bio")) {
  db.exec("ALTER TABLE users ADD COLUMN bio TEXT");
}

export default db;