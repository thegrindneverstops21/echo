import { MS_PER_SECOND } from "../shared/constants";

export interface MeterSample {
  timeMs: number; // recorder.durationMillis (active audio time, pauses excluded)
  db: number | null; // null = recorder gave no metering value
}

export interface MeterSummary {
  samples: number;
  missing: number;
  minDb: number | null;
  maxDb: number | null;
  medianDb: number | null;
  samplesPerSecond: number;
}

export function summariseMetering(
  samples: readonly MeterSample[],
): MeterSummary {
  const values = samples
    .flatMap((s) => (s.db === null ? [] : [s.db]))
    .sort((a, b) => a - b);
  const spanMs =
    samples.length > 1
      ? samples[samples.length - 1].timeMs - samples[0].timeMs
      : 0;
  return {
    samples: samples.length,
    missing: samples.length - values.length,
    minDb: values.length ? values[0] : null,
    maxDb: values.length ? values[values.length - 1] : null,
    medianDb: values.length ? values[Math.floor(values.length / 2)] : null,
    samplesPerSecond:
      spanMs > 0 ? (samples.length * MS_PER_SECOND) / spanMs : 0,
  };
}
