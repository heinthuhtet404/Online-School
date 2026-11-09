import { createContext, useContext, useState, ReactNode } from "react";
import i18n from "./i18n";

type Lang = "my" | "en";
const LangCtx = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "my", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("my");
  const setLang = (l: Lang) => {
    setLangState(l);
    i18n.changeLanguage(l);
  };
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);