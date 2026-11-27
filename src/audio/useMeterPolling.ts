import { useEffect } from "react";
import type { AudioRecorder } from "expo-audio";
import { METERING_POLL_MS } from "../shared/constants";
import type { MeterSample } from "./meterSummary";

export function useMeterPolling(
  recorder: AudioRecorder,
  active: boolean,
  onSample: (sample: MeterSample) => void,
): void {
  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => {
      const status = recorder.getStatus();
      onSample({ timeMs: status.durationMillis, db: status.metering ?? null });
    }, METERING_POLL_MS);
    return () => clearInterval(timer);
  }, [recorder, active, onSample]);
}
