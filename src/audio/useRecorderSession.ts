import { useCallback, useRef, useState } from "react";
import { useAudioRecorder } from "expo-audio";
import { randomUUID } from "expo-crypto";
import { toMessage } from "../shared/errors";
import { markFailed, type Recording } from "../storage/recordingsRepository";
import { beginCapture, endCapture } from "./captureSession";
import {
  summariseMetering,
  type MeterSample,
  type MeterSummary,
} from "./meterSummary";
import { ensureMicAccess, type MicAccess } from "./permissions";
import { RECORDING_OPTIONS } from "./recordingOptions";
import { useMeterPolling } from "./useMeterPolling";

export type RecorderPhase = "idle" | "preparing" | "recording" | "finalising";

export interface SessionError {
  message: string;
  canOpenSettings: boolean;
}

const PERMISSION_COPY: Record<Exclude<MicAccess, "granted">, SessionError> = {
  denied: {
    message:
      "Microphone access was denied. ECHO needs it to record. Press Record to ask again.",
    canOpenSettings: false,
  },
  blocked: {
    message:
      "Microphone access is blocked. Turn it on for ECHO in system settings, then come back.",
    canOpenSettings: true,
  },
};

export function useRecorderSession(onSaved: (recording: Recording) => void) {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [levelDb, setLevelDb] = useState<number | null>(null);
  const [error, setError] = useState<SessionError | null>(null);
  const [summary, setSummary] = useState<MeterSummary | null>(null);
  const phaseRef = useRef<RecorderPhase>("idle");
  const busyRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const samplesRef = useRef<MeterSample[]>([]);

  const moveTo = useCallback((next: RecorderPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const onSample = useCallback((sample: MeterSample) => {
    samplesRef.current.push(sample);
    setElapsedMs(sample.timeMs);
    setLevelDb(sample.db);
  }, []);
  useMeterPolling(recorder, phase === "recording", onSample);

  const fail = useCallback(
    async (cause: unknown) => {
      setError({ message: toMessage(cause), canOpenSettings: false });
      moveTo("idle");
      const id = sessionIdRef.current;
      if (id) await markFailed(id, Date.now()).catch(() => undefined);
    },
    [moveTo],
  );

  const start = useCallback(async () => {
    if (busyRef.current || phaseRef.current !== "idle") return;
    busyRef.current = true;
    setError(null);
    setSummary(null);
    try {
      moveTo("preparing");
      const access = await ensureMicAccess();
      if (access !== "granted") {
        setError(PERMISSION_COPY[access]);
        moveTo("idle");
        return;
      }
      const id = randomUUID();
      sessionIdRef.current = id;
      samplesRef.current = [];
      setElapsedMs(0);
      await beginCapture(recorder, id);
      moveTo("recording");
    } catch (cause) {
      await fail(cause);
    } finally {
      busyRef.current = false;
    }
  }, [recorder, moveTo, fail]);

  const stop = useCallback(async () => {
    const id = sessionIdRef.current;
    if (busyRef.current || phaseRef.current !== "recording" || !id) return;
    busyRef.current = true;
    moveTo("finalising");
    try {
      const saved = await endCapture(recorder, id);
      setSummary(summariseMetering(samplesRef.current));
      moveTo("idle");
      onSaved(saved);
    } catch (cause) {
      await fail(cause);
    } finally {
      busyRef.current = false;
    }
  }, [recorder, moveTo, fail, onSaved]);

  return { phase, elapsedMs, levelDb, error, summary, start, stop };
}
