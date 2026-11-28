import { AppError } from "../shared/errors";
import {
  fileNameFromUri,
  inspectAudioFile,
  resolveAudioFile,
  toRelativePath,
} from "../storage/audioFiles";
import {
  getById,
  markReady,
  type Recording,
} from "../storage/recordingsRepository";
import { probeDurationMs } from "./probeDuration";

interface FinalizeInput {
  id: string;
  recorderUri: string | null;
  expectedFileName: string;
}

// Returns a recording only after file AND database state have been read back.
export async function finalizeRecording(
  input: FinalizeInput,
): Promise<Recording> {
  const fileName = input.recorderUri
    ? fileNameFromUri(input.recorderUri)
    : input.expectedFileName;
  const relativeFilename = toRelativePath(fileName);
  const facts = inspectAudioFile(relativeFilename);
  if (!facts.exists)
    throw new AppError("file_missing", "The recording file was not found.");
  if (facts.sizeBytes === 0)
    throw new AppError("file_empty", "The recording file is empty.");

  const durationMs = await probeDurationMs(
    resolveAudioFile(relativeFilename).uri,
  );
  await markReady({
    id: input.id,
    relativeFilename,
    durationMs,
    fileSizeBytes: facts.sizeBytes,
    nowMs: Date.now(),
  });
  return verifyPersisted(input.id, relativeFilename);
}

async function verifyPersisted(
  id: string,
  relativeFilename: string,
): Promise<Recording> {
  const saved = await getById(id);
  if (!saved || saved.state !== "ready")
    throw new AppError("storage_failed", "The recording was not saved.");
  if (!inspectAudioFile(relativeFilename).exists)
    throw new AppError("file_missing", "The saved file disappeared.");
  return saved;
}
