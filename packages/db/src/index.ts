import { Database } from "bun:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Outside the release directories, so every deploy finds the same file.
export const DEFAULT_PATH = "/srv/app/data/hello.db";
const MIGRATIONS = join(import.meta.dir, "..", "migrations");
export const NOTE_MAX = 280;
const SHOWN_NOTES = 20;

export type Note = { id: number; body: string; created_at: string };

export function openDb(path = process.env.SQLITE_PATH ?? DEFAULT_PATH): Database {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true, strict: true });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
  return db;
}

// Applies the files in migrations/ not applied yet, in name order, each in
// its own transaction.
export function migrate(db: Database): string[] {
  db.exec("CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const done = new Set(db.query<{ name: string }, []>("SELECT name FROM migrations").all().map((r) => r.name));
  const pending = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql") && !done.has(f))
    .sort();
  for (const name of pending) {
    db.transaction(() => {
      db.exec(readFileSync(join(MIGRATIONS, name), "utf8"));
      db.query("INSERT INTO migrations (name, applied_at) VALUES ($name, datetime('now'))").run({ name });
    })();
  }
  return pending;
}

export function visit(db: Database): number {
  return db.query<{ count: number }, []>("UPDATE visits SET count = count + 1 WHERE id = 1 RETURNING count").get()?.count ?? 0;
}

export function addNote(db: Database, body: string): Note | null {
  const text = body.trim().slice(0, NOTE_MAX);
  if (!text) return null;
  return db.query<Note, { body: string }>("INSERT INTO notes (body) VALUES ($body) RETURNING *").get({ body: text });
}

export function latestNotes(db: Database): Note[] {
  return db.query<Note, { limit: number }>("SELECT * FROM notes ORDER BY id DESC LIMIT $limit").all({ limit: SHOWN_NOTES });
}
