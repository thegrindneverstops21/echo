import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { FONT, MIN_TOUCH_TARGET, RADIUS, SPACING } from "../../theme/tokens";

export function ArchiveInput(props: TextInputProps) {
  const { palette } = useTheme();
  return (
    <TextInput
      {...props}
      placeholderTextColor={palette.textMuted}
      style={[styles.input, { color: palette.text, borderColor: palette.outline }, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    fontFamily: FONT.sans,
    fontSize: 16,
    paddingHorizontal: SPACING.md,
  },
});
