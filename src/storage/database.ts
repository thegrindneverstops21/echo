import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { DB_NAME } from "../shared/constants";

// Append-only. Never edit a shipped migration; add a new entry instead.
const MIGRATIONS: readonly string[] = [
  `CREATE TABLE recordings (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    relative_filename TEXT UNIQUE,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    duration_ms INTEGER,
    file_size_bytes INTEGER,
    state TEXT NOT NULL CHECK (state IN
      ('capturing','saving','ready','unavailable','failed','pending_delete','purging')),
    recovered INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX idx_recordings_state_created ON recordings (state, created_at_ms DESC);`,
];

let dbPromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function openAndMigrate(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync(DB_NAME);
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  await migrate(db);
  return db;
}

async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const current = row?.user_version ?? 0;
  for (let version = current; version < MIGRATIONS.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
