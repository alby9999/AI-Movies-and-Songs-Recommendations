import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'reel_record.db');

const db = new Database(dbPath);
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

const savedMediaColumns = db.prepare("PRAGMA table_info(saved_media)").all().map(column => column.name);
if (!savedMediaColumns.includes("poster")) {
  db.exec("ALTER TABLE saved_media ADD COLUMN poster TEXT");
}
if (!savedMediaColumns.includes("audio_preview_url")) {
  db.exec("ALTER TABLE saved_media ADD COLUMN audio_preview_url TEXT");
}
if (!savedMediaColumns.includes("spotify_url")) {
  db.exec("ALTER TABLE saved_media ADD COLUMN spotify_url TEXT");
}
if (!savedMediaColumns.includes("language")) {
  db.exec("ALTER TABLE saved_media ADD COLUMN language TEXT");
}
if (!savedMediaColumns.includes("streaming")) {
  db.exec("ALTER TABLE saved_media ADD COLUMN streaming TEXT");
}

export default db;