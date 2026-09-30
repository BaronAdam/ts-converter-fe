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
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  Language,
  LANGUAGE_STORAGE_KEY,
  Translations,
  translations,
} from "./translations";
import { LANG_FADE_MS } from "../initScript";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: translations[DEFAULT_LANGUAGE],
});

const FADING_ATTRIBUTE = "data-lang-fading";

/** Animate only where we can tell the user hasn't asked for reduced motion. */
const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia !== "function" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fades translatable content back in once the new text has rendered,
 * unless another language swap has started in the meantime.
 */
const endFade = (isSwapPending: () => boolean) =>
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => {
      if (!isSwapPending()) {
        document.documentElement.removeAttribute(FADING_ATTRIBUTE);
      }
    }),
  );

const readStoredLanguage = (): Language | null => {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Start with the default so the server render and first client render match,
  // then apply the saved language after mount.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  const fadeTimer = useRef<number>(undefined);
  const swapPending = useRef(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
    }
    // the pre-paint script hides content for a saved non-default language
    endFade(() => swapPending.current);

    return () => {
      window.clearTimeout(fadeTimer.current);
      document.documentElement.removeAttribute(FADING_ATTRIBUTE);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const applyLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode etc.) - keep the choice in memory
    }
  }, []);

  const setLanguage = useCallback(
    (next: Language) => {
      window.clearTimeout(fadeTimer.current);

      if (prefersReducedMotion()) {
        swapPending.current = false;
        applyLanguage(next);
        return;
      }

      // fade out, swap the text while it is hidden, fade back in
      swapPending.current = true;
      document.documentElement.setAttribute(FADING_ATTRIBUTE, "");
      fadeTimer.current = window.setTimeout(() => {
        swapPending.current = false;
        applyLanguage(next);
        endFade(() => swapPending.current);
      }, LANG_FADE_MS);
    },
    [applyLanguage],
  );

  const value = useMemo(
    () => ({ language, setLanguage, t: translations[language] }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue =>
  useContext(LanguageContext);
