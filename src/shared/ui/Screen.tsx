import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../theme/ThemeProvider";
import { SPACING } from "../../theme/tokens";

export function Screen({ children }: { children: ReactNode }) {
  const { name, palette } = useTheme();
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: palette.background }]}
    >
      <StatusBar style={name === "midnight" ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: SPACING.xl },
});
