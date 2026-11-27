import { Text, type TextProps, type TextStyle } from "react-native";
import { FONT } from "../../theme/tokens";
import { useTheme } from "../../theme/ThemeProvider";

type Variant = "display" | "section" | "body" | "meta" | "timer";
type Tone = "text" | "textMuted" | "signal" | "danger" | "success" | "visual";

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontFamily: FONT.serif, fontSize: 40, lineHeight: 46 },
  section: { fontFamily: FONT.serif, fontSize: 24, lineHeight: 30 },
  body: { fontFamily: FONT.sans, fontSize: 16, lineHeight: 22 },
  meta: { fontFamily: FONT.sansMedium, fontSize: 13, lineHeight: 18 },
  timer: {
    fontFamily: FONT.sansMedium,
    fontSize: 56,
    lineHeight: 64,
    fontVariant: ["tabular-nums"],
  },
};

const TIMER_MAX_SCALE = 1.3;

interface Props extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

export function AppText({
  variant = "body",
  tone = "text",
  style,
  ...rest
}: Props) {
  const { palette } = useTheme();
  const maxScale = variant === "timer" ? TIMER_MAX_SCALE : undefined;
  return (
    <Text
      maxFontSizeMultiplier={maxScale}
      style={[VARIANTS[variant], { color: palette[tone] }, style]}
      {...rest}
    />
  );
}
