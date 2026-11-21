import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({ theme: "dark", setTheme: () => {}, toggle: () => {} });
export const THEME_KEY = "datapulse-theme";

/** Inline script that applies the saved theme before paint. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'dark';document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  };
  return <Ctx.Provider value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
