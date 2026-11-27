import { getDatabase } from "./database";

export type RecordingState =
  | "capturing"
  | "saving"
  | "ready"
  | "unavailable"
  | "failed"
  | "pending_delete"
  | "purging";

export interface Recording {
  id: string;
  title: string;
  relativeFilename: string | null;
  createdAtMs: number;
  durationMs: number | null;
  fileSizeBytes: number | null;
  state: RecordingState;
}

interface RecordingRow {
  id: string;
  title: string;
  relative_filename: string | null;
  created_at_ms: number;
  duration_ms: number | null;
  file_size_bytes: number | null;
  state: RecordingState;
}

const COLUMNS =
  "id, title, relative_filename, created_at_ms, duration_ms, file_size_bytes, state";

function toRecording(row: RecordingRow): Recording {
  return {
    id: row.id,
    title: row.title,
    relativeFilename: row.relative_filename,
    createdAtMs: row.created_at_ms,
    durationMs: row.duration_ms,
    fileSizeBytes: row.file_size_bytes,
    state: row.state,
  };
}

export interface NewCapture {
  id: string;
  title: string;
  relativeFilename: string;
  nowMs: number;
}

export async function insertCapturing(input: NewCapture): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO recordings (id, title, relative_filename, created_at_ms, updated_at_ms, state)
     VALUES (?, ?, ?, ?, ?, 'capturing')`,
    [input.id, input.title, input.relativeFilename, input.nowMs, input.nowMs],
  );
}

export interface ReadyFacts {
  id: string;
  relativeFilename: string;
  durationMs: number;
  fileSizeBytes: number;
  nowMs: number;
}

export async function markReady(facts: ReadyFacts): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE recordings
        SET relative_filename = ?, duration_ms = ?, file_size_bytes = ?,
            updated_at_ms = ?, state = 'ready'
      WHERE id = ?`,
    [
      facts.relativeFilename,
      facts.durationMs,
      facts.fileSizeBytes,
      facts.nowMs,
      facts.id,
    ],
  );
}

// Keeps the row and any audio file. Recovery is handled by a later checkpoint.
export async function markFailed(id: string, nowMs: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE recordings SET state = 'failed', updated_at_ms = ? WHERE id = ?`,
    [nowMs, id],
  );
}

export async function getById(id: string): Promise<Recording | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RecordingRow>(
    `SELECT ${COLUMNS} FROM recordings WHERE id = ?`,
    [id],
  );
  return row ? toRecording(row) : null;
}

export async function listReady(): Promise<Recording[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecordingRow>(
    `SELECT ${COLUMNS} FROM recordings WHERE state = 'ready' ORDER BY created_at_ms DESC`,
  );
  return rows.map(toRecording);
}
