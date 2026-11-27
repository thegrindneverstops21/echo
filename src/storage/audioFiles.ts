import { File, Paths } from "expo-file-system";
import { AUDIO_DIR } from "../shared/constants";
import { AppError } from "../shared/errors";

const SAFE_FILE_NAME = /^[A-Za-z0-9._-]+$/;

export interface FileFacts {
  exists: boolean;
  sizeBytes: number;
}

export function fileNameFromUri(uri: string): string {
  const clean = uri.split("?")[0];
  return clean.substring(clean.lastIndexOf("/") + 1);
}

export function toRelativePath(fileName: string): string {
  return `${AUDIO_DIR}/${fileName}`;
}

export function resolveAudioFile(relativePath: string): File {
  const [dir, name, ...rest] = relativePath.split("/");
  const valid = dir === AUDIO_DIR && !!name && rest.length === 0;
  if (!valid || !SAFE_FILE_NAME.test(name) || name.includes("..")) {
    throw new AppError(
      "storage_failed",
      "Rejected an invalid audio file path.",
    );
  }
  return new File(Paths.document, AUDIO_DIR, name);
}

export function inspectAudioFile(relativePath: string): FileFacts {
  const file = resolveAudioFile(relativePath);
  if (!file.exists) return { exists: false, sizeBytes: 0 };
  return { exists: true, sizeBytes: file.size ?? 0 };
}
