export type ThemeName = "midnight" | "studio";

export interface Palette {
  background: string;
  surface: string;
  border: string; // decorative dividers only (not a control boundary)
  outline: string; // control boundaries, >= 3:1 on background and surface
  text: string;
  textMuted: string;
  visual: string;
  signal: string; // recording / active states only
  onSignal: string;
  danger: string;
  success: string;
}

export const PALETTES: Record<ThemeName, Palette> = {
  midnight: {
    background: "#171918",
    surface: "#222522",
    border: "#3D413C",
    outline: "#7A8077",
    text: "#EDEFEA",
    textMuted: "#9CA39A",
    visual: "#AFB8A6",
    signal: "#DF7040",
    onSignal: "#171918",
    danger: "#E5776B",
    success: "#8FBF8A",
  },
  studio: {
    background: "#F3F4F0",
    surface: "#E5E8E2",
    border: "#CCD1C8",
    outline: "#7C8379",
    text: "#222522",
    textMuted: "#5A6158",
    visual: "#667360",
    signal: "#C34E24",
    onSignal: "#FFFFFF",
    danger: "#B3382C",
    success: "#356B32",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  huge: 32,
} as const;
export const RADIUS = { sm: 6, md: 12, round: 999 } as const;
export const MIN_TOUCH_TARGET = 48;

export const FONT = {
  serif: "InstrumentSerif_400Regular",
  sans: "Geist_400Regular",
  sansMedium: "Geist_500Medium",
} as const;
