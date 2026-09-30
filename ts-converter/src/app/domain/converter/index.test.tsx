import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TsConverter from ".";
import { LanguageProvider } from "@/app/i18n/LanguageProvider";
import { LANGUAGE_STORAGE_KEY } from "@/app/i18n/translations";
import { THEME_STORAGE_KEY } from "@/app/initScript";
import { ThemeProvider } from "@/app/theme/ThemeProvider";

const convertTime = vi.hoisted(() => vi.fn());
vi.mock("@/app/api/convert", () => ({ convertTime }));

const renderApp = async (lang: string | null = "en") => {
  if (lang) window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  render(
    <ThemeProvider>
      <LanguageProvider>
        <TsConverter />
      </LanguageProvider>
    </ThemeProvider>,
  );
  // the saved language is applied after mount
  if (lang === "en") await screen.findByText("Time Converter");
};

const hours = () => screen.getByLabelText("Hours");
const minutes = () => screen.getByLabelText("Minutes");
const press = (name: string | RegExp) =>
  userEvent.click(screen.getByRole("button", { name }));
// synchronous click, for assertions that depend on animation timing
const pressNow = (name: string | RegExp) =>
  fireEvent.click(screen.getByRole("button", { name }));

const setReducedMotion = (reduce: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: () => ({ matches: reduce }),
  });
};

afterEach(() => {
  // @ts-expect-error restore jsdom's default (no matchMedia)
  delete window.matchMedia;
  document.documentElement.removeAttribute("data-lang-fading");
  document.documentElement.classList.remove("theme-transition");
});

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  convertTime.mockReset();
  convertTime.mockResolvedValue({ Hours: 1, Minutes: 5 });
});

describe("TsConverter", () => {
  it("starts empty with no request", async () => {
    await renderApp();

    expect(screen.getByText("Enter the in-game time to see the result.")).toBeInTheDocument();
    expect(convertTime).not.toHaveBeenCalled();
  });

  it("converts total minutes for ATS outside a city by default and shows the result", async () => {
    await renderApp();
    await userEvent.type(hours(), "1");
    await userEvent.type(minutes(), "30");

    expect(await screen.findByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("1 h 5 min")).toBeInTheDocument();
    expect(screen.getByText("From 1 h 30 min in game")).toBeInTheDocument();
    expect(convertTime).toHaveBeenLastCalledWith({
      game: "ats",
      area: "outside",
      region: "mainland",
      minutes: 90,
    });
    expect(screen.getByText("1 real minute = 20 game minutes")).toBeInTheDocument();
  });

  it("sends one request for a burst of typing", async () => {
    await renderApp();
    await userEvent.type(minutes(), "45");
    await screen.findByText("1:05");

    expect(convertTime).toHaveBeenCalledTimes(1);
    expect(convertTime).toHaveBeenCalledWith(expect.objectContaining({ minutes: 45 }));
  });

  it("uses the city endpoint inside a city", async () => {
    await renderApp();
    await press(/Inside a city/);
    await userEvent.type(minutes(), "10");
    await screen.findByText("1:05");

    expect(convertTime).toHaveBeenLastCalledWith(
      expect.objectContaining({ area: "city", minutes: 10 }),
    );
    expect(screen.getByText("1 real minute = 3 game minutes")).toBeInTheDocument();
  });

  it("only offers the region for ETS outside a city", async () => {
    await renderApp();
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();

    await press(/ETS/);
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();

    await press(/Inside a city/);
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
  });

  it("converts for the UK region", async () => {
    await renderApp();
    await press(/ETS/);
    await press(/United Kingdom/);
    await userEvent.type(minutes(), "15");
    await screen.findByText("1:05");

    expect(convertTime).toHaveBeenLastCalledWith({
      game: "ets",
      area: "outside",
      region: "uk",
      minutes: 15,
    });
    expect(screen.getByText("1 real minute = 15 game minutes")).toBeInTheDocument();
  });

  it("ignores a stale UK choice after switching back to ATS", async () => {
    await renderApp();
    await press(/ETS/);
    await press(/United Kingdom/);
    await press(/ATS/);
    await userEvent.type(minutes(), "20");
    await screen.findByText("1:05");

    expect(convertTime).toHaveBeenLastCalledWith(
      expect.objectContaining({ game: "ats", region: "mainland" }),
    );
  });

  it.each([
    ["30 min", 30],
    ["1 h", 60],
    ["2 h", 120],
    ["6 h", 360],
    ["12 h", 720],
    ["24 h", 1440],
  ])("quick pick %s sends %d minutes", async (label, total) => {
    await renderApp();
    await press(label);
    await screen.findByText("1:05");

    expect(convertTime).toHaveBeenLastCalledWith(expect.objectContaining({ minutes: total }));
    expect(hours()).toHaveValue(String(Math.floor(total / 60)));
    expect(minutes()).toHaveValue(String(total % 60));
  });

  it("steps hours by 1 and minutes by 5", async () => {
    await renderApp();
    await press("Increase hours");
    await press("Increase hours");
    await press("Increase minutes");

    expect(hours()).toHaveValue("2");
    expect(minutes()).toHaveValue("5");

    await press("Decrease hours");
    await press("Decrease minutes");
    await press("Decrease minutes");
    expect(hours()).toHaveValue("1");
    expect(minutes()).toHaveValue("0");
  });

  it("clamps minutes to 59 and lets inputs be cleared without NaN", async () => {
    await renderApp();
    await userEvent.type(minutes(), "75");
    expect(minutes()).toHaveValue("59");

    await userEvent.clear(minutes());
    expect(minutes()).toHaveValue("");
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
  });

  it("clear button empties the inputs and the result", async () => {
    await renderApp();
    await userEvent.type(minutes(), "10");
    await screen.findByText("1:05");

    await press("Clear");

    expect(minutes()).toHaveValue("");
    expect(screen.getByText("Enter the in-game time to see the result.")).toBeInTheDocument();
  });

  it("shows an error and retries", async () => {
    convertTime.mockResolvedValueOnce(null);
    await renderApp();
    await userEvent.type(minutes(), "10");

    expect(await screen.findByText("Couldn't fetch the result.")).toBeInTheDocument();

    await press("Try again");

    expect(await screen.findByText("1:05")).toBeInTheDocument();
    expect(convertTime).toHaveBeenCalledTimes(2);
  });

  it("ignores a slow response for input that has since changed", async () => {
    let resolveFirst: (v: TimeConverterDto) => void = () => {};
    convertTime.mockImplementationOnce(
      () => new Promise<TimeConverterDto>((r) => (resolveFirst = r)),
    );
    convertTime.mockResolvedValueOnce({ Hours: 9, Minutes: 9 });
    await renderApp();

    await userEvent.type(minutes(), "1");
    await waitFor(() => expect(convertTime).toHaveBeenCalledTimes(1));
    await userEvent.type(minutes(), "0");
    await screen.findByText("9:09");

    resolveFirst({ Hours: 1, Minutes: 1 });
    await new Promise((r) => setTimeout(r, 20));

    expect(screen.getByText("9:09")).toBeInTheDocument();
    expect(screen.queryByText("1:01")).not.toBeInTheDocument();
  });

  describe("language", () => {
    it("defaults to Polish", async () => {
      await renderApp(null);

      expect(screen.getByRole("heading", { name: "Konwerter czasu" })).toBeInTheDocument();
      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "PL" })).toHaveAttribute("aria-pressed", "true");
    });

    it("restores the saved language and ignores an invalid one", async () => {
      await renderApp("en");
      expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
    });

    it("falls back to Polish for an invalid saved value", async () => {
      await renderApp("de");
      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
    });

    it("switches, saves the choice and translates results", async () => {
      await renderApp(null);
      await press("EN");

      expect(screen.getByLabelText("Hours")).toBeInTheDocument();
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
      expect(document.documentElement.lang).toBe("en");

      await userEvent.type(minutes(), "10");
      await screen.findByText("1 h 5 min");
      await press("PL");
      expect(screen.getByText("1 godz. 5 min")).toBeInTheDocument();
      expect(screen.getByText("Z 0 godz. 10 min w grze")).toBeInTheDocument();
    });
  });

  describe("theme", () => {
    it("toggles the dark class and saves the choice", async () => {
      await renderApp();
      const toggle = () => screen.getByRole("button", { name: "Switch light/dark theme" });

      await userEvent.click(toggle());
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

      await userEvent.click(toggle());
      expect(document.documentElement).not.toHaveClass("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("picks up the theme applied before hydration", async () => {
      document.documentElement.classList.add("dark");
      await renderApp();

      await userEvent.click(screen.getByRole("button", { name: "Switch light/dark theme" }));
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });

  describe("animations", () => {
    const root = document.documentElement;

    it("fades the language out, swaps the text while hidden, then fades back in", async () => {
      setReducedMotion(false);
      await renderApp(null);
      pressNow("EN");

      // still Polish while fading out
      expect(root).toHaveAttribute("data-lang-fading");
      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();

      expect(await screen.findByLabelText("Hours")).toBeInTheDocument();
      await waitFor(() => expect(root).not.toHaveAttribute("data-lang-fading"));
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en");
    });

    it("lets the last language choice win when toggled quickly", async () => {
      setReducedMotion(false);
      await renderApp(null);
      pressNow("EN");
      pressNow("PL");

      await waitFor(() => expect(root).not.toHaveAttribute("data-lang-fading"));
      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pl");
    });

    it("fades content in after applying a saved language on load", async () => {
      setReducedMotion(false);
      root.setAttribute("data-lang-fading", ""); // what the pre-paint script does
      await renderApp("en");

      await waitFor(() => expect(root).not.toHaveAttribute("data-lang-fading"));
      expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    });

    it("swaps the language instantly with reduced motion", async () => {
      setReducedMotion(true);
      await renderApp(null);
      await press("EN");

      expect(root).not.toHaveAttribute("data-lang-fading");
      expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    });

    it("crossfades the theme, then removes the transition class", async () => {
      setReducedMotion(false);
      await renderApp();
      pressNow("Switch light/dark theme");

      expect(root).toHaveClass("dark");
      expect(root).toHaveClass("theme-transition");
      await waitFor(() => expect(root).not.toHaveClass("theme-transition"));
      expect(root).toHaveClass("dark");
    });

    it("switches the theme without a transition with reduced motion", async () => {
      setReducedMotion(true);
      await renderApp();
      await press("Switch light/dark theme");

      expect(root).toHaveClass("dark");
      expect(root).not.toHaveClass("theme-transition");
    });
  });
});
