import { Linking, StyleSheet, View } from "react-native";
import { AppText } from "../../shared/ui/AppText";
import { PrimaryAction } from "../../shared/ui/PrimaryAction";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { formatClock } from "../../shared/format";
import { METER_FLOOR_DB } from "../../shared/constants";
import { SPACING } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";
import type { MeterSummary } from "../../audio/meterSummary";
import type {
  RecorderPhase,
  SessionError,
} from "../../audio/useRecorderSession";

interface Props {
  phase: RecorderPhase;
  elapsedMs: number;
  levelDb: number | null;
  error: SessionError | null;
  summary: MeterSummary | null;
  onStart: () => void;
  onStop: () => void;
}

const STATUS_LABEL: Record<RecorderPhase, string> = {
  idle: "MIC OFF",
  preparing: "CHECKING MICROPHONE",
  recording: "RECORDING",
  finalising: "SAVING",
};

const fmtDb = (value: number | null) =>
  value === null ? "n/a" : `${value.toFixed(1)} dB`;

export function RecorderPanel(props: Props) {
  const { phase, elapsedMs, error, onStart, onStop } = props;
  const isRecording = phase === "recording";
  return (
    <View style={styles.panel}>
      <AppText
        variant="meta"
        tone={isRecording ? "signal" : "textMuted"}
        accessibilityLiveRegion="polite"
      >
        {STATUS_LABEL[phase]}
      </AppText>
      <AppText
        variant="timer"
        accessibilityLabel={`Elapsed ${formatClock(elapsedMs)}`}
      >
        {formatClock(elapsedMs)}
      </AppText>
      <MeterReadout {...props} />
      {error ? <ErrorBlock error={error} /> : null}
      <PrimaryAction
        kind={isRecording ? "neutral" : "record"}
        label={isRecording ? "Stop and save" : "Record"}
        disabled={phase === "preparing" || phase === "finalising"}
        onPress={isRecording ? onStop : onStart}
      />
    </View>
  );
}

function ErrorBlock({ error }: { error: SessionError }) {
  const action = error.canOpenSettings ? "Open settings" : undefined;
  return (
    <StatusBanner
      message={error.message}
      actionLabel={action}
      onAction={() => void Linking.openSettings()}
    />
  );
}

// Spike S04 diagnostics: real recorder metering only, no simulated values.
function MeterReadout({ phase, levelDb, summary }: Props) {
  const { palette } = useTheme();
  const fill =
    levelDb === null
      ? 0
      : Math.min(Math.max((levelDb - METER_FLOOR_DB) / -METER_FLOOR_DB, 0), 1);
  if (phase !== "recording" && !summary) return null;
  return (
    <View style={styles.meter}>
      <AppText variant="meta" tone="textMuted">
        INPUT LEVEL · S04 DIAGNOSTIC
      </AppText>
      {phase === "recording" ? (
        <>
          <View
            style={[
              styles.track,
              {
                backgroundColor: palette.surface,
                borderColor: palette.outline,
              },
            ]}
          >
            <View
              style={{
                width: `${fill * 100}%`,
                height: "100%",
                backgroundColor: palette.signal,
              }}
            />
          </View>
          <AppText variant="meta">{fmtDb(levelDb)}</AppText>
        </>
      ) : summary ? (
        <AppText variant="meta">
          {`Last take: ${summary.samples} samples (${summary.samplesPerSecond.toFixed(1)}/s), ` +
            `min ${fmtDb(summary.minDb)}, median ${fmtDb(summary.medianDb)}, ` +
            `max ${fmtDb(summary.maxDb)}, missing ${summary.missing}`}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: SPACING.md, paddingVertical: SPACING.xxl },
  meter: { gap: SPACING.xs },
  track: { height: 10, borderWidth: 1, borderRadius: 5, overflow: "hidden" },
});
