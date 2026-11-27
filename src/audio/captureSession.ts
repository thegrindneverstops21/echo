import type { AudioRecorder } from "expo-audio";
import { AUDIO_EXTENSION } from "../shared/constants";
import { toRelativePath } from "../storage/audioFiles";
import {
  insertCapturing,
  type Recording,
} from "../storage/recordingsRepository";
import { makeAutoTitle } from "../features/recorder/autoTitle";
import { finalizeRecording } from "./finalizeRecording";
import { RECORDING_OPTIONS } from "./recordingOptions";

const expectedFileName = (id: string) => `${id}${AUDIO_EXTENSION}`;

// The intent row is written BEFORE the native recorder starts.
export async function beginCapture(
  recorder: AudioRecorder,
  id: string,
): Promise<void> {
  const nowMs = Date.now();
  await insertCapturing({
    id,
    title: makeAutoTitle(new Date(nowMs)),
    relativeFilename: toRelativePath(expectedFileName(id)),
    nowMs,
  });
  await recorder.prepareToRecordAsync({ ...RECORDING_OPTIONS, fileName: id });
  recorder.record();
}

export async function endCapture(
  recorder: AudioRecorder,
  id: string,
): Promise<Recording> {
  const uriBeforeStop = recorder.uri;
  await recorder.stop();
  return finalizeRecording({
    id,
    recorderUri: recorder.uri ?? uriBeforeStop,
    expectedFileName: expectedFileName(id),
  });
}
