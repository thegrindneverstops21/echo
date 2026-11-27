import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Screen } from "../shared/ui/Screen";
import { AppText } from "../shared/ui/AppText";
import { StatusBanner } from "../shared/ui/StatusBanner";
import { RecorderPanel } from "../features/recorder/RecorderPanel";
import { RecordingRow } from "../features/player/RecordingRow";
import { useLibrary } from "../features/library/useLibrary";
import { ArchiveInput } from "../features/library/ArchiveInput";
import { RenameRecordingDialog } from "../features/library/RenameRecordingDialog";
import { CompactAction } from "../shared/ui/PrimaryAction";
import type { Recording } from "../storage/recordingsRepository";
import { useRecorderSession } from "../audio/useRecorderSession";
import { usePlayback } from "../audio/usePlayback";
import { SPACING } from "../theme/tokens";

export default function HomeScreen() {
  const library = useLibrary();
  const playback = usePlayback();
  const session = useRecorderSession(() => void library.reload());
  const [search, setSearch] = useState("");
  const [renaming, setRenaming] = useState<Recording | null>(null);
  const query = search.trim().toLowerCase();
  const recordings = query
    ? library.items.filter((item) => item.title.toLowerCase().includes(query))
    : library.items;

  const startRecording = () => {
    playback.pause();
    void session.start();
  };

  return (
    <Screen>
      <FlatList
        data={recordings}
        keyboardShouldPersistTaps="handled"
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
            <View style={styles.search}>
              <ArchiveInput
                accessibilityLabel="Search recording titles"
                placeholder="Search recordings"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
              {search ? <CompactAction label="Clear search" onPress={() => setSearch("")} /> : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <AppText tone="textMuted">
            {query ? "No recordings match your search." : "No recordings yet. Press Record to capture your first one."}
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
            onRename={() => setRenaming(item)}
            onSkip={(direction) => void playback.skip(direction)}
          />
        )}
      />
      {renaming ? (
        <RenameRecordingDialog
          recording={renaming}
          onClose={() => setRenaming(null)}
          onSaved={() => {
            setRenaming(null);
            void library.reload();
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: SPACING.sm },
  search: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.md },
  searchInput: { flex: 1, minWidth: 120 },
});
