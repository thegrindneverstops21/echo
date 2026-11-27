import { StyleSheet, View } from "react-native";
import { AppText } from "../../shared/ui/AppText";
import { CompactAction } from "../../shared/ui/PrimaryAction";
import { formatClock, formatDateTime } from "../../shared/format";
import { SKIP_SECONDS } from "../../shared/constants";
import { SPACING } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { Recording } from "../../storage/recordingsRepository";

interface Props {
  recording: Recording;
  isActive: boolean;
  isPlaying: boolean;
  positionMs: number;
  playerDurationMs: number;
  onToggle: () => void;
  onRename: () => void;
  onSkip: (direction: 1 | -1) => void;
}

export function RecordingRow(props: Props) {
  const { recording, isActive, isPlaying, onToggle } = props;
  const { palette } = useTheme();
  const verb = isActive && isPlaying ? "Pause" : "Play";
  return (
    <View style={[styles.row, { borderBottomColor: palette.border }]}>
      <View style={styles.text}>
        <AppText variant="body" numberOfLines={2}>
          {recording.title}
        </AppText>
        <AppText variant="meta" tone="textMuted">
          {`${formatDateTime(recording.createdAtMs)} · ${formatClock(recording.durationMs ?? 0)}`}
        </AppText>
        {isActive ? <PlaybackStrip {...props} /> : null}
      </View>
      <View style={styles.actions}>
        <CompactAction label={verb} onPress={onToggle} />
        <CompactAction label="Rename" onPress={props.onRename} />
      </View>
    </View>
  );
}

function PlaybackStrip({
  positionMs,
  playerDurationMs,
  recording,
  onSkip,
}: Props) {
  const total =
    playerDurationMs > 0 ? playerDurationMs : (recording.durationMs ?? 0);
  return (
    <View style={styles.strip}>
      <AppText
        variant="meta"
        tone="signal"
      >{`${formatClock(positionMs)} / ${formatClock(total)}`}</AppText>
      <CompactAction label={`-${SKIP_SECONDS}s`} onPress={() => onSkip(-1)} />
      <CompactAction label={`+${SKIP_SECONDS}s`} onPress={() => onSkip(1)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: SPACING.xs },
  actions: { gap: SPACING.xs },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: "wrap",
  },
});
