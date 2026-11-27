import { Pressable, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../../theme/ThemeProvider";
import { MIN_TOUCH_TARGET, RADIUS, SPACING } from "../../theme/tokens";

type Kind = "record" | "neutral";

interface Props {
  label: string;
  onPress: () => void;
  kind?: Kind;
  disabled?: boolean;
  accessibilityHint?: string;
}

const PRIMARY_HEIGHT = 56;

export function PrimaryAction({
  label,
  onPress,
  kind = "neutral",
  disabled = false,
  accessibilityHint,
}: Props) {
  const { palette } = useTheme();
  const isRecord = kind === "record";
  const background = isRecord ? palette.signal : "transparent";
  const borderColor = isRecord ? palette.signal : palette.outline;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: palette.border }}
      style={[
        styles.base,
        { backgroundColor: background, borderColor },
        disabled && styles.disabled,
      ]}
    >
      <AppText
        variant="body"
        style={{ color: isRecord ? palette.onSignal : palette.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function CompactAction(props: Omit<Props, "kind">) {
  const { palette } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ disabled: props.disabled ?? false }}
      disabled={props.disabled}
      onPress={props.onPress}
      android_ripple={{ color: palette.border }}
      style={[
        styles.compact,
        { borderColor: palette.outline },
        props.disabled && styles.disabled,
      ]}
    >
      <AppText variant="meta">{props.label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: PRIMARY_HEIGHT,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxl,
  },
  compact: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  disabled: { opacity: 0.4 },
});
