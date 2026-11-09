import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

export const LIGHT = {
  bg: "#F8F7F2",
  card: "#FFFFFF",
  ink: "#252536",
  muted: "#8B8B9E",
  primary: "#4055DC",
  secondary: "#D2F078",
  accent: "#FF8066",
  border: "#E5E2D8",
  inputBg: "#FFFFFF",
  softBg: "#ECE9DE",
};

export const DARK = {
  bg: "#14141B",
  card: "#1F1F2A",
  ink: "#F0F0F5",
  muted: "#8B8B9E",
  primary: "#6B7CFF",
  secondary: "#D2F078",
  accent: "#FF8066",
  border: "#2A2A38",
  inputBg: "#1F1F2A",
  softBg: "#252532",
};

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

  useEffect(() => {
    AsyncStorage.getItem("theme").then((v) => {
      if (v === "dark" || v === "light") setModeState(v);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem("theme", m);
  };

  return (
    <Ctx.Provider value={{ mode, setMode, C: mode === "dark" ? DARK : LIGHT }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);