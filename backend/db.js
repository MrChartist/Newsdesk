// Newsdesk SQLite Database — persistent article archive
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'newsdesk.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Performance pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache

// ─── Schema ──────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    link          TEXT PRIMARY KEY,
    id            TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT DEFAULT '',
    pubDate       INTEGER NOT NULL,
    image         TEXT,
    category      TEXT DEFAULT 'General',
    companies     TEXT DEFAULT '[]',
    source_id     TEXT NOT NULL,
    source_name   TEXT NOT NULL,
    source_color  TEXT DEFAULT '#888',
    created_at    INTEGER DEFAULT (unixepoch() * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_articles_pubDate ON articles(pubDate DESC);
  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
`);

console.log(`  💾  Database initialized: ${DB_PATH}`);

// ─── Prepared Statements ─────────────────────
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO articles (link, id, title, description, pubDate, image, category, companies, source_id, source_name, source_color)
  VALUES (@link, @id, @title, @description, @pubDate, @image, @category, @companies, @source_id, @source_name, @source_color)
`);

const insertMany = db.transaction((articles) => {
  let inserted = 0;
  for (const article of articles) {
    const result = insertStmt.run({
      link: article.link,
      id: article.id,
      title: article.title,
      description: article.description || '',
      pubDate: new Date(article.pubDate).getTime(),
      image: article.image || null,
      category: article.category || 'General',
      companies: JSON.stringify(article.companies || []),
      source_id: article.source.id,
      source_name: article.source.name,
      source_color: article.source.color,
    });
    if (result.changes > 0) inserted++;
  }
  return inserted;
});

const selectRecent = db.prepare(`
  SELECT * FROM articles
  WHERE pubDate >= ?
  ORDER BY pubDate DESC
`);

const selectByCategory = db.prepare(`
  SELECT * FROM articles
  WHERE category = ? AND pubDate >= ?
  ORDER BY pubDate DESC
`);

const selectByCompany = db.prepare(`
  SELECT * FROM articles
  WHERE companies LIKE ? AND pubDate >= ?
  ORDER BY pubDate DESC
  LIMIT 100
`);

const pruneOld = db.prepare(`
  DELETE FROM articles WHERE pubDate < ?
`);

const countAll = db.prepare(`SELECT COUNT(*) as count FROM articles`);

// ─── Public API ──────────────────────────────

/** Insert articles into the database. Returns count of newly inserted. */
export function archiveArticles(articles) {
  return insertMany(articles);
}

/** Get all articles from the last N days, sorted by newest first. */
export function getRecentArticles(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const rows = selectRecent.all(cutoff);
  return rows.map(rowToArticle);
}

/** Get articles by category from the last N days. */
export function getArticlesByCategory(category, days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const rows = selectByCategory.all(category, cutoff);
  return rows.map(rowToArticle);
}

/** Get articles mentioning a company symbol. */
export function getArticlesByCompany(symbol, days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const rows = selectByCompany.all(`%"${symbol}"%`, cutoff);
  return rows.map(rowToArticle);
}

/** Prune articles older than N days. Returns count deleted. */
export function pruneArticles(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const result = pruneOld.run(cutoff);
  return result.changes;
}

/** Get total article count. */
export function getArticleCount() {
  return countAll.get().count;
}

// ─── Helpers ─────────────────────────────────
function rowToArticle(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    link: row.link,
    pubDate: new Date(row.pubDate).toISOString(),
    image: row.image,
    category: row.category,
    companies: JSON.parse(row.companies || '[]'),
    source: {
      id: row.source_id,
      name: row.source_name,
      color: row.source_color,
    },
  };
}

export default db;
