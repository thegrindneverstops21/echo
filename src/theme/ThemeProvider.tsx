import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { PALETTES, type Palette, type ThemeName } from "./tokens";

interface ThemeValue {
  name: ThemeName;
  palette: Palette;
}

const ThemeContext = createContext<ThemeValue>({
  name: "midnight",
  palette: PALETTES.midnight,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const value = useMemo<ThemeValue>(() => {
    const name: ThemeName = scheme === "light" ? "studio" : "midnight";
    return { name, palette: PALETTES[name] };
  }, [scheme]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}
