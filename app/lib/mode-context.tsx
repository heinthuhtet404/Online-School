import { createContext, useContext, useState, ReactNode } from "react";

type Mode = "student" | "teacher";
type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
  isTeacher: boolean;
};

const ModeCtx = createContext<Ctx>({
  mode: "student",
  setMode: () => {},
  toggle: () => {},
  isTeacher: false,
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("student");
  return (
    <ModeCtx.Provider
      value={{
        mode,
        setMode,
        toggle: () => setMode((m) => (m === "student" ? "teacher" : "student")),
        isTeacher: mode === "teacher",
      }}
    >
      {children}
    </ModeCtx.Provider>
  );
}

export const useMode = () => useContext(ModeCtx);