import { FlatList, StyleSheet, View } from "react-native";
import { Screen } from "../shared/ui/Screen";
import { AppText } from "../shared/ui/AppText";
import { StatusBanner } from "../shared/ui/StatusBanner";
import { RecorderPanel } from "../features/recorder/RecorderPanel";
import { RecordingRow } from "../features/player/RecordingRow";
import { useLibrary } from "../features/library/useLibrary";
import { useRecorderSession } from "../audio/useRecorderSession";
import { usePlayback } from "../audio/usePlayback";
import { SPACING } from "../theme/tokens";

export default function HomeScreen() {
  const library = useLibrary();
  const playback = usePlayback();
  const session = useRecorderSession(() => void library.reload());

  const startRecording = () => {
    playback.pause();
    void session.start();
  };

  return (
    <Screen>
      <FlatList
        data={library.items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <AppText variant="display">ECHO</AppText>
            <RecorderPanel
              {...session}
              onStart={startRecording}
              onStop={() => void session.stop()}
            />
            {playback.error ? <StatusBanner message={playback.error} /> : null}
            {library.error ? <StatusBanner message={library.error} /> : null}
            <AppText variant="section" style={styles.heading}>
              Recordings
            </AppText>
          </View>
        }
        ListEmptyComponent={
          <AppText tone="textMuted">
            No recordings yet. Press Record to capture your first one.
          </AppText>
        }
        renderItem={({ item }) => (
          <RecordingRow
            recording={item}
            isActive={playback.activeId === item.id}
            isPlaying={playback.isPlaying}
            positionMs={playback.positionMs}
            playerDurationMs={playback.durationMs}
            onToggle={() => void playback.toggle(item)}
            onSkip={(direction) => void playback.skip(direction)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: SPACING.sm },
});
