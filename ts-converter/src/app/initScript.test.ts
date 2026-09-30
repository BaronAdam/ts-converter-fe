import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  initScript,
  LANGUAGE_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./initScript";

const setMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({ matches: prefersDark }),
  });
};

const run = () => new Function(initScript)();
const root = document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  root.classList.remove("dark");
  root.removeAttribute("data-lang-fading");
  setMatchMedia(false);
});

afterEach(() => {
  // @ts-expect-error restore jsdom's default (no matchMedia)
  delete window.matchMedia;
});

describe("initScript", () => {
  it("uses the saved theme over the system preference", () => {
    setMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    run();
    expect(root).not.toHaveClass("dark");

    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    setMatchMedia(false);
    run();
    expect(root).toHaveClass("dark");
  });

  it("follows the system preference when nothing is saved", () => {
    setMatchMedia(true);
    run();
    expect(root).toHaveClass("dark");

    setMatchMedia(false);
    run();
    expect(root).not.toHaveClass("dark");
  });

  it("hides content for a saved non-default language only", () => {
    run();
    expect(root).not.toHaveAttribute("data-lang-fading");

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pl");
    run();
    expect(root).not.toHaveAttribute("data-lang-fading");

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
    run();
    expect(root).toHaveAttribute("data-lang-fading");
  });

  it("never throws when storage is unavailable", () => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("blocked");
      },
    });
    try {
      expect(run).not.toThrow();
    } finally {
      // @ts-expect-error remove the override so jsdom's storage is used again
      delete window.localStorage;
    }
  });
});
