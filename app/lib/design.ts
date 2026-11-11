// ===== Candy Universe × Playful 3D × Tactile Soft UI =====

export const CANDY = {
  bg: "#E9E4FF",
  primary: "#7656F6",
  secondary: "#64C9FF",
  pink: "#FF83B5",
  yellow: "#FFE16A",
  mint: "#75DDB5",
  text: "#25264A",
  surface: "#FFFFFF",
  // အနည်းငယ် ပိုနက်သော shade များ (pressed state, borders)
  primaryDark: "#5B3FD9",
  primarySoft: "#EDE8FF",
  textMuted: "#6B6C8F",
  border: "#DCD6FF",
  // Soft shadow color
  shadow: "#7A5CF0",
};

// ===== Spacing scale =====
export const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// ===== Radius scale =====
export const R = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 };

// ===== Tactile shadow presets =====
export const SHADOW = {
  soft: {
    shadowColor: CANDY.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    shadowColor: CANDY.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  pressed: {
    shadowColor: CANDY.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
};

// ===== Fonts =====
export const FONT = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
};