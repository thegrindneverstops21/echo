import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { CompactAction } from "./PrimaryAction";
import { useTheme } from "../../theme/ThemeProvider";
import { RADIUS, SPACING } from "../../theme/tokens";

interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusBanner({ message, actionLabel, onAction }: Props) {
  const { palette } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.box,
        { backgroundColor: palette.surface, borderColor: palette.danger },
      ]}
    >
      <AppText tone="danger" variant="meta">
        Problem
      </AppText>
      <AppText>{message}</AppText>
      {actionLabel && onAction ? (
        <CompactAction label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
});
