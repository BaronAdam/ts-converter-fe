import { describe, expect, it } from "vitest";
import { detectLanguage, isLanguage, LANGUAGES, translations } from "./translations";

describe("translations", () => {
  it("has the same keys in every language", () => {
    const [first, ...rest] = LANGUAGES;
    const keys = Object.keys(translations[first]).sort();

    for (const lang of rest) {
      expect(Object.keys(translations[lang]).sort()).toEqual(keys);
    }
  });

  it("has no empty strings", () => {
    for (const lang of LANGUAGES) {
      for (const value of Object.values(translations[lang])) {
        if (typeof value === "string") expect(value.trim()).not.toBe("");
      }
    }
  });

  it("formats interpolated messages", () => {
    expect(translations.pl.arrival("12:04:30", 0)).toBe("Będziesz na miejscu o 12:04:30");
    expect(translations.en.arrival("12:04:30", 0)).toBe("You'll arrive at 12:04:30");
    expect(translations.pl.arrival("01:00:00", 1)).toContain("(jutro)");
    expect(translations.pl.arrival("01:00:00", 2)).toContain("(pojutrze)");
    expect(translations.pl.arrival("01:00:00", 5)).toContain("(za 5 dni)");
    expect(translations.en.arrival("01:00:00", 1)).toContain("(tomorrow)");
    expect(translations.en.arrival("01:00:00", 13)).toContain("(in 13 days)");
    expect(translations.pl.rate(20)).toContain("20");
    expect(translations.en.from(2, 30)).toContain("2 h 30 min");
  });

  it.each([
    ["pl", true],
    ["en", true],
    ["de", false],
    ["", false],
    [null, false],
  ])("isLanguage(%j) -> %s", (value, expected) => {
    expect(isLanguage(value)).toBe(expected);
  });
});

describe("detectLanguage", () => {
  it.each([
    [["pl"], "pl"],
    [["pl-PL"], "pl"],
    [["PL-pl"], "pl"],
    [["en"], "en"],
    [["en-US"], "en"],
    [["en-GB", "pl"], "en"],
    [["de-DE", "pl-PL", "en"], "pl"],
    [["de", "fr", "en-US"], "en"],
    [["de-DE"], "en"],
    [["ja"], "en"],
    [[], "en"],
    [[""], "en"],
  ])("%j -> %s", (preferred, expected) => {
    expect(detectLanguage(preferred)).toBe(expected);
  });

  it("does not mistake other languages that merely start with the same letters", () => {
    expect(detectLanguage(["pt-BR"])).toBe("en"); // Portuguese, not Polish
    expect(detectLanguage(["ens"])).toBe("en");
  });
});
