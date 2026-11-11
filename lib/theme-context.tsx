import { createContext, useContext, useState, ReactNode } from "react";
import { CANDY } from "./design";

export type ThemeMode = "light" | "dark";

// Candy palette ကို light mode အဖြစ် သတ်မှတ်
const LIGHT = {
  bg: CANDY.bg,
  card: CANDY.surface,
  ink: CANDY.text,
  muted: CANDY.textMuted,
  primary: CANDY.primary,
  secondary: CANDY.mint,
  accent: CANDY.pink,
  border: CANDY.border,
  inputBg: CANDY.surface,
  softBg: CANDY.primarySoft,
};

// Dark mode ကို ယာယီ light အတိုင်း ထားပါ (နောက်မှ ပြင်မယ်)
const DARK = LIGHT;

type ThemeCtx = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  C: typeof LIGHT;
};

const Ctx = createContext<ThemeCtx>({
  mode: "light",
  setMode: () => {},
  C: LIGHT,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const setMode = (m: ThemeMode) => setModeState(m);
  return (
    <Ctx.Provider value={{ mode, setMode, C: LIGHT }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);