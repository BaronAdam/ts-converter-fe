import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TsConverter from ".";
import { LanguageProvider } from "@/app/i18n/LanguageProvider";
import { LANGUAGE_STORAGE_KEY } from "@/app/i18n/translations";
import { THEME_STORAGE_KEY } from "@/app/initScript";
import { ThemeProvider } from "@/app/theme/ThemeProvider";
import { setSystemLanguages } from "@/test-utils/systemLanguage";

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
  vi.useRealTimers();
  // @ts-expect-error restore jsdom's default (no matchMedia)
  delete window.matchMedia;
  document.documentElement.removeAttribute("data-lang-fading");
  // @ts-expect-error remove the view transition stub
  delete document.startViewTransition;
  // @ts-expect-error remove the animate stub
  delete Element.prototype.animate;
});

const stubViewTransition = () => {
  const start = vi.fn((update: () => void) => {
    update();
    return { ready: Promise.resolve() };
  });
  const animate = vi.fn();
  Object.assign(document, { startViewTransition: start });
  Object.assign(Element.prototype, { animate });
  return { start, animate };
};

beforeEach(() => {
  // only Date is faked, so timers and user-event keep running normally
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 30, 12, 0, 0));
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("TsConverter", () => {
  it("starts empty", async () => {
    await renderApp();

    expect(screen.getByText("Enter the in-game time to see the result.")).toBeInTheDocument();
    expect(screen.getByText("–:––:––")).toBeInTheDocument();
  });

  it("converts total minutes for ATS outside a city by default, with seconds", async () => {
    await renderApp();
    await userEvent.type(hours(), "1");
    await userEvent.type(minutes(), "30");

    // 90 game minutes / 20 = 4.5 real minutes
    expect(screen.getByText("0:04:30")).toBeInTheDocument();
    expect(screen.getByText("You'll arrive at 12:04:30")).toBeInTheDocument();
    // the big figure is not repeated as words underneath
    expect(screen.queryByText(/\d+ h \d+ min \d+ s/)).not.toBeInTheDocument();
    expect(screen.getByText("From 1 h 30 min in game")).toBeInTheDocument();
    expect(screen.getByText("1 real minute = 20 game minutes")).toBeInTheDocument();
  });

  it("says tomorrow when the trip crosses midnight", async () => {
    vi.setSystemTime(new Date(2026, 8, 30, 23, 59, 0));
    await renderApp();
    await press("30 min"); // 30 / 20 = 90 s

    expect(screen.getByText("You'll arrive at 00:00:30 (tomorrow)")).toBeInTheDocument();
  });

  it("says how many days away a long trip ends", async () => {
    await renderApp();
    await userEvent.type(hours(), "999");
    await press(/Inside a city/); // 333 h

    expect(screen.getByText("You'll arrive at 09:00:00 (in 14 days)")).toBeInTheDocument();
  });

  it("measures the arrival from when the inputs last changed, not from the clock", async () => {
    await renderApp();
    await press("30 min");
    expect(screen.getByText("You'll arrive at 12:01:30")).toBeInTheDocument();

    // an hour passes with nothing touched: the arrival must not drift
    vi.setSystemTime(new Date(2026, 8, 30, 13, 0, 0));
    expect(screen.getByText("You'll arrive at 12:01:30")).toBeInTheDocument();

    // changing an input recalculates from the current time
    await press("1 h");
    expect(screen.getByText("You'll arrive at 13:03:00")).toBeInTheDocument();
  });

  it("recalculates from the current time when only the mode changes", async () => {
    await renderApp();
    await press("30 min");
    vi.setSystemTime(new Date(2026, 8, 30, 14, 0, 0));
    await press(/Inside a city/); // 30 / 3 = 10 min

    expect(screen.getByText("You'll arrive at 14:10:00")).toBeInTheDocument();
  });

  it("shows fractions of a minute as seconds", async () => {
    await renderApp();
    await userEvent.type(hours(), "3");
    await userEvent.type(minutes(), "20");
    await press(/Inside a city/);

    // 200 game minutes / 3 = 66.666... real minutes = 4000 s
    expect(screen.getByText("1:06:40")).toBeInTheDocument();
    expect(screen.getByText("1 real minute = 3 game minutes")).toBeInTheDocument();
  });

  it("uses the mainland rate for ETS outside a city", async () => {
    await renderApp();
    await press(/ETS/);
    await userEvent.type(minutes(), "19");

    expect(screen.getByText("0:01:00")).toBeInTheDocument();
    expect(screen.getByText("1 real minute = 19 game minutes")).toBeInTheDocument();
  });

  it("uses the UK rate for the UK region", async () => {
    await renderApp();
    await press(/ETS/);
    await press(/United Kingdom/);
    await userEvent.type(minutes(), "15");

    expect(screen.getByText("0:01:00")).toBeInTheDocument();
    expect(screen.getByText("1 real minute = 15 game minutes")).toBeInTheDocument();
  });

  it("only offers the region for ETS outside a city", async () => {
    await renderApp();
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();

    await press(/ETS/);
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();

    await press(/Inside a city/);
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
  });

  it("ignores a stale UK choice after switching back to ATS", async () => {
    await renderApp();
    await press(/ETS/);
    await press(/United Kingdom/);
    await press(/ATS/);
    await userEvent.type(minutes(), "20");

    expect(screen.getByText("0:01:00")).toBeInTheDocument();
    expect(screen.getByText("1 real minute = 20 game minutes")).toBeInTheDocument();
  });

  it("recalculates immediately when the mode changes", async () => {
    await renderApp();
    await userEvent.type(minutes(), "30");
    expect(screen.getByText("0:01:30")).toBeInTheDocument(); // 30 / 20

    await press(/Inside a city/);
    expect(screen.getByText("0:10:00")).toBeInTheDocument(); // 30 / 3
  });

  it.each([
    ["30 min", "0:01:30"],
    ["1 h", "0:03:00"],
    ["2 h", "0:06:00"],
    ["6 h", "0:18:00"],
    ["12 h", "0:36:00"],
    ["24 h", "1:12:00"],
  ])("quick pick %s gives %s", async (label, expected) => {
    await renderApp();
    await press(label);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("shows the quick pick in the inputs", async () => {
    await renderApp();
    await press("12 h");

    expect(hours()).toHaveValue("12");
    expect(minutes()).toHaveValue("0");
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

  it("only offers Clear once there is a result", async () => {
    await renderApp();
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();

    await userEvent.type(minutes(), "10");
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("swaps the empty hint and the result lines by collapsing, not unmounting", async () => {
    await renderApp();
    const hiddenAncestor = (text: string) =>
      screen.getByText(text).closest("[aria-hidden]") as HTMLElement;

    // empty: the hint is open, the arrival lines are collapsed
    expect(hiddenAncestor("Enter the in-game time to see the result.")).toHaveAttribute("aria-hidden", "false");

    await userEvent.type(minutes(), "30");
    expect(hiddenAncestor("Enter the in-game time to see the result.")).toHaveAttribute("aria-hidden", "true");
    expect(hiddenAncestor("You'll arrive at 12:01:30")).toHaveAttribute("aria-hidden", "false");
  });

  it("keeps the last result readable while it collapses after Clear", async () => {
    await renderApp();
    await userEvent.type(minutes(), "30");
    expect(screen.getByText("You'll arrive at 12:01:30")).toBeInTheDocument();

    await press("Clear");

    // the text is still there (so it can be seen sliding away) but hidden and inert
    const arrival = screen.getByText("You'll arrive at 12:01:30");
    const box = arrival.closest("[aria-hidden]") as HTMLElement;
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box).toHaveAttribute("inert");
    expect(screen.getByText("From 0 h 30 min in game")).toBeInTheDocument();
    expect(screen.getByText("Enter the in-game time to see the result.").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("does not let the collapsed Clear button take focus", async () => {
    await renderApp();
    await userEvent.type(minutes(), "30");
    await press("Clear");

    const clear = screen.getByText("Clear").closest("button") as HTMLButtonElement;
    expect(clear.closest("[inert]")).not.toBeNull();
  });

  it("shows the new result immediately after Clear and typing again", async () => {
    await renderApp();
    await userEvent.type(minutes(), "30");
    await press("Clear");
    await userEvent.type(minutes(), "60".slice(0, 1));

    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByText("Enter the in-game time to see the result.").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("clear button empties the inputs and the result", async () => {
    await renderApp();
    await userEvent.type(minutes(), "10");
    expect(screen.getByText("0:00:30")).toBeInTheDocument();

    await press("Clear");

    expect(minutes()).toHaveValue("");
    expect(screen.getByText("Enter the in-game time to see the result.")).toBeInTheDocument();
  });

  it("handles the largest input without overflowing the layout text", async () => {
    await renderApp();
    await userEvent.type(hours(), "999");
    await press(/Inside a city/);

    // 999 h * 60 / 3 = 19980 real minutes = 333 h
    expect(screen.getByText("333:00:00")).toBeInTheDocument();
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

    it("follows an English system language when nothing is saved", async () => {
      setSystemLanguages(["en-GB"]);
      await renderApp(null);

      expect(await screen.findByLabelText("Hours")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
      // following the system is not a choice, so nothing is saved
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
    });

    it("uses English for any system language other than Polish", async () => {
      setSystemLanguages(["de-DE", "fr"]);
      await renderApp(null);

      expect(await screen.findByLabelText("Hours")).toBeInTheDocument();
    });

    it("only looks at the primary system language", async () => {
      setSystemLanguages(["de-DE", "pl-PL"]);
      await renderApp(null);
      expect(await screen.findByLabelText("Hours")).toBeInTheDocument();
    });

    it("uses Polish for a Polish primary language even with English second", async () => {
      setSystemLanguages(["pl-PL", "en-US"]);
      await renderApp(null);

      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
    });

    it("lets a saved language win over the system language", async () => {
      setSystemLanguages(["en-US"]);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pl");
      await renderApp("pl");

      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
    });

    it("keeps the chosen language once picked, even if the system differs", async () => {
      setSystemLanguages(["en-US"]);
      await renderApp(null);
      await screen.findByLabelText("Hours");
      await press("PL");

      expect(screen.getByLabelText("Godziny")).toBeInTheDocument();
      expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("pl");
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
      expect(screen.getByText("You'll arrive at 12:00:30")).toBeInTheDocument();
      await press("PL");
      expect(screen.getByText("Będziesz na miejscu o 12:00:30")).toBeInTheDocument();
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

    it("reveals the new theme as a circle from the toggle via a view transition", async () => {
      setReducedMotion(false);
      const { start, animate } = stubViewTransition();
      await renderApp();
      pressNow("Switch light/dark theme");

      expect(start).toHaveBeenCalledTimes(1);
      expect(root).toHaveClass("dark");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
      await waitFor(() => expect(animate).toHaveBeenCalledTimes(1));
      expect(animate).toHaveBeenCalledWith(
        { clipPath: [expect.stringMatching(/^circle\(0px at/), expect.stringMatching(/^circle\(.+px at/)] },
        expect.objectContaining({ pseudoElement: "::view-transition-new(root)" }),
      );

      pressNow("Switch light/dark theme");
      expect(root).not.toHaveClass("dark");
    });

    it("switches instantly when view transitions are unsupported", async () => {
      setReducedMotion(false);
      await renderApp();
      pressNow("Switch light/dark theme");

      expect(root).toHaveClass("dark");
    });

    it("does not start a view transition with reduced motion", async () => {
      setReducedMotion(true);
      const { start } = stubViewTransition();
      await renderApp();
      pressNow("Switch light/dark theme");

      expect(start).not.toHaveBeenCalled();
      expect(root).toHaveClass("dark");
    });
  });
});
