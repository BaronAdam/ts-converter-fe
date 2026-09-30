"use client";

import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { THEME_FADE_MS, THEME_STORAGE_KEY } from "../initScript";

export type Theme = "light" | "dark";

export { THEME_STORAGE_KEY };

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

/** Animate only where we can tell the user hasn't asked for reduced motion. */
const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia !== "function" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readAppliedTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const transitionTimer = useRef<number>(undefined);

  useEffect(() => {
    // the init script already applied the saved/system theme to <html>
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readAppliedTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next: Theme = readAppliedTheme() === "dark" ? "light" : "dark";

    if (!prefersReducedMotion()) {
      // enables a short colour crossfade on every surface (see globals.css)
      root.classList.add("theme-transition");
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(
        () => root.classList.remove("theme-transition"),
        THEME_FADE_MS + 50,
      );
    }

    root.classList.toggle("dark", next === "dark");
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable - keep the choice in memory
    }
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
