import { useCallback, useState } from "react";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { MS_PER_SECOND, SKIP_SECONDS } from "../shared/constants";
import { toMessage } from "../shared/errors";
import { inspectAudioFile, resolveAudioFile } from "../storage/audioFiles";
import type { Recording } from "../storage/recordingsRepository";

const END_EPSILON_SECONDS = 0.1;

export function usePlayback() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (recording: Recording) => {
      const path = recording.relativeFilename;
      if (!path || !inspectAudioFile(path).exists) {
        setError(
          "This recording\u2019s audio file is missing, so it cannot be played.",
        );
        return;
      }
      player.replace(resolveAudioFile(path).uri);
      setActiveId(recording.id);
      player.play();
    },
    [player],
  );

  const resume = useCallback(async () => {
    const atEnd =
      status.duration > 0 &&
      status.currentTime >= status.duration - END_EPSILON_SECONDS;
    if (atEnd) await player.seekTo(0);
    player.play();
  }, [player, status.currentTime, status.duration]);

  const toggle = useCallback(
    async (recording: Recording) => {
      setError(null);
      try {
        if (activeId !== recording.id) return load(recording);
        if (status.playing) return player.pause();
        await resume();
      } catch (cause) {
        setError(toMessage(cause));
      }
    },
    [activeId, load, player, resume, status.playing],
  );

  const skip = useCallback(
    async (direction: 1 | -1) => {
      if (!activeId || status.duration <= 0) return;
      const target = status.currentTime + direction * SKIP_SECONDS;
      await player.seekTo(Math.min(Math.max(target, 0), status.duration));
    },
    [activeId, player, status.currentTime, status.duration],
  );

  const pause = useCallback(() => player.pause(), [player]);

  return {
    activeId,
    isPlaying: status.playing,
    positionMs: Math.round(status.currentTime * MS_PER_SECOND),
    durationMs: Math.round(status.duration * MS_PER_SECOND),
    error,
    toggle,
    skip,
    pause,
  };
}
