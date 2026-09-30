"use client";

import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { THEME_REVEAL_MS, THEME_STORAGE_KEY } from "../initScript";

export type Theme = "light" | "dark";

export { THEME_STORAGE_KEY };

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: (origin?: RevealOrigin) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

/** Animate only where we can tell the user hasn't asked for reduced motion. */
/** Animate only where we can tell the user hasn't asked for reduced motion. */
const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia !== "function" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readAppliedTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export type RevealOrigin = { x: number; y: number };

/** Expands the new theme as a circle from the origin (see ::view-transition rules in globals.css). */
const revealFrom = ({ x, y }: RevealOrigin) => {
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${radius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: THEME_REVEAL_MS,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    },
  );
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // the init script already applied the saved/system theme to <html>
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readAppliedTheme());
  }, []);

  const toggleTheme = useCallback((origin?: RevealOrigin) => {
    const root = document.documentElement;
    const next: Theme = readAppliedTheme() === "dark" ? "light" : "dark";

    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    };

    if (!prefersReducedMotion() && typeof document.startViewTransition === "function") {
      // Snapshot old and new pages and reveal the new one, so text never
      // cross-fades against its background (which makes it vanish mid-way).
      const transition = document.startViewTransition(() => flushSync(apply));
      if (origin) {
        transition.ready.then(() => revealFrom(origin)).catch(() => {});
      }
    } else {
      apply();
    }

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
