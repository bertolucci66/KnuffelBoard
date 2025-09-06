import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'knuffelboard.db');

// Ensure directory exists (it does), create DB file on first open implicitly
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('active','finished'))
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS game_players (
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  PRIMARY KEY (game_id, player_id)
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  value INTEGER NOT NULL,
  UNIQUE (game_id, player_id, category)
);

CREATE TABLE IF NOT EXISTS highscores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  achieved_at TEXT NOT NULL
);
`);

// --- Compatibility: ensure 'active' column exists for legacy queries ---
function tableInfo(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all();
}
export function hasColumn(table, column) {
  try {
    const rows = tableInfo(table);
    return rows.some(r => r.name === column);
  } catch {
    return false;
  }
}

try {
  if (!hasColumn('games', 'active')) {
    db.exec('ALTER TABLE games ADD COLUMN active INTEGER');
    // Initialize according to status
    db.exec(`UPDATE games SET active = CASE WHEN status = 'active' THEN 1 ELSE 0 END`);
  }
} catch (e) {
  // If ALTER TABLE fails (older SQLite), ignore; app will still work with 'status'
  console.warn('Compat: unable to add games.active column (can be ignored):', e.message);
}

export function nowIso() {
  return new Date().toISOString();
}

export const CATEGORIES_UPPER = ['ones','twos','threes','fours','fives','sixes'];
export const CATEGORIES_LOWER = ['three_kind','four_kind','full_house','small_straight','large_straight','kniffel','chance'];
export const ALL_CATEGORIES = [...CATEGORIES_UPPER, ...CATEGORIES_LOWER];

export function calcUpperSum(scoresByCat) {
  return CATEGORIES_UPPER.reduce((sum, c) => sum + (scoresByCat[c] ?? 0), 0);
}
export function calcLowerSum(scoresByCat) {
  return CATEGORIES_LOWER.reduce((sum, c) => sum + (scoresByCat[c] ?? 0), 0);
}
export function calcBonus(upperSum) {
  return upperSum >= 63 ? 35 : 0;
}
export function calcTotal(scoresByCat) {
  const upper = calcUpperSum(scoresByCat);
  const bonus = calcBonus(upper);
  const lower = calcLowerSum(scoresByCat);
  return { upper, bonus, lower, total: upper + bonus + lower };
}

export default db;
