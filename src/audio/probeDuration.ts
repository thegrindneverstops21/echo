import { createAudioPlayer } from "expo-audio";
import { DURATION_PROBE_TIMEOUT_MS, MS_PER_SECOND } from "../shared/constants";
import { AppError } from "../shared/errors";

// Asks the native player for the real duration of a finished file.
export function probeDurationMs(uri: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const player = createAudioPlayer(uri);
    let settled = false;

    const settle = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.remove();
      player.remove();
      action();
    };

    const subscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.isLoaded && status.duration > 0) {
          settle(() => resolve(Math.round(status.duration * MS_PER_SECOND)));
        }
      },
    );

    const timer = setTimeout(() => {
      settle(() =>
        reject(
          new AppError(
            "duration_unknown",
            "Could not read the recording length.",
          ),
        ),
      );
    }, DURATION_PROBE_TIMEOUT_MS);

    if (player.isLoaded && player.duration > 0) {
      settle(() => resolve(Math.round(player.duration * MS_PER_SECOND)));
    }
  });
}
