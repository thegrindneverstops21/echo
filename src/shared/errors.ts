export type ErrorCode =
  | "recorder_busy"
  | "record_failed"
  | "file_missing"
  | "file_empty"
  | "duration_unknown"
  | "storage_failed"
  | "playback_failed";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly detail?: unknown;

  constructor(code: ErrorCode, message: string, detail?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.detail = detail;
  }
}

export function toMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
}
