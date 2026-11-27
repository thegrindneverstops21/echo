import { RecordingPresets, type RecordingOptions } from "expo-audio";

// Spike S02/S03: record straight into the persistent document directory.
export const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: "document",
  isMeteringEnabled: true,
};
