import { useRef, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { AppText } from "../../shared/ui/AppText";
import { CompactAction } from "../../shared/ui/PrimaryAction";
import { Screen } from "../../shared/ui/Screen";
import { StatusBanner } from "../../shared/ui/StatusBanner";
import { toMessage } from "../../shared/errors";
import { MAX_RECORDING_TITLE_LENGTH, renameRecording, type Recording } from "../../storage/recordingsRepository";
import { SPACING } from "../../theme/tokens";
import { ArchiveInput } from "./ArchiveInput";

export function RenameRecordingDialog({ recording, onClose, onSaved }: {
  recording: Recording;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(recording.title);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);

  const cancel = () => {
    if (!inFlight.current) onClose();
  };

  const save = async () => {
    if (inFlight.current || !title.trim()) return;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      await renameRecording(recording.id, title);
      onSaved();
    } catch (cause) {
      setError(toMessage(cause));
      setSaving(false);
      inFlight.current = false;
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={cancel}>
      <Screen>
        <View style={styles.content}>
          <AppText variant="section">Rename recording</AppText>
          <ArchiveInput
            accessibilityLabel="Recording title"
            value={title}
            onChangeText={setTitle}
            maxLength={MAX_RECORDING_TITLE_LENGTH}
            selectTextOnFocus
            editable={!saving}
          />
          {!title.trim() ? <AppText tone="textMuted">Enter a recording title.</AppText> : null}
          {error ? <StatusBanner message={error} /> : null}
          <View style={styles.actions}>
            <CompactAction label="Cancel" onPress={cancel} disabled={saving} />
            <CompactAction
              label={saving ? "Saving…" : "Save title"}
              disabled={saving || !title.trim()}
              onPress={() => void save()}
            />
          </View>
        </View>
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: { gap: SPACING.md },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
});
