import { setAudioModeAsync } from "expo-audio";

//unverified on device: confirm interruption behavior in spike S05
export function configureAudioSession(): Promise<void> {
  return setAudioModeAsync({
    playsInSilentMode: true,
    allowsRecording: true,
    interruptionMode: "doNotMix",
    shouldPlayInBackground: true,
  });
}
