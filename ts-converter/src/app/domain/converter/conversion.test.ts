import { describe, expect, it } from "vitest";
import { convertToRealTime, formatDuration, toDuration } from "./conversion";

describe("toDuration", () => {
  it.each([
    [0, { hours: 0, minutes: 0, seconds: 0 }],
    [59, { hours: 0, minutes: 0, seconds: 59 }],
    [60, { hours: 0, minutes: 1, seconds: 0 }],
    [3599, { hours: 0, minutes: 59, seconds: 59 }],
    [3600, { hours: 1, minutes: 0, seconds: 0 }],
    [3661, { hours: 1, minutes: 1, seconds: 1 }],
    [86400, { hours: 24, minutes: 0, seconds: 0 }],
  ])("%d s", (seconds, expected) => {
    expect(toDuration(seconds)).toEqual(expected);
  });
});

describe("convertToRealTime", () => {
  it.each([
    // ATS: 3 in a city, 20 outside
    ["ats", "city", "mainland", 3, { hours: 0, minutes: 1, seconds: 0 }],
    ["ats", "city", "mainland", 180, { hours: 1, minutes: 0, seconds: 0 }],
    ["ats", "city", "mainland", 200, { hours: 1, minutes: 6, seconds: 40 }],
    ["ats", "outside", "mainland", 20, { hours: 0, minutes: 1, seconds: 0 }],
    ["ats", "outside", "mainland", 1200, { hours: 1, minutes: 0, seconds: 0 }],
    // ETS: 3 in a city, 19 on the mainland, 15 in the UK
    ["ets", "city", "mainland", 3, { hours: 0, minutes: 1, seconds: 0 }],
    ["ets", "city", "uk", 180, { hours: 1, minutes: 0, seconds: 0 }],
    ["ets", "outside", "mainland", 19, { hours: 0, minutes: 1, seconds: 0 }],
    ["ets", "outside", "mainland", 1140, { hours: 1, minutes: 0, seconds: 0 }],
    ["ets", "outside", "uk", 15, { hours: 0, minutes: 1, seconds: 0 }],
    ["ets", "outside", "uk", 900, { hours: 1, minutes: 0, seconds: 0 }],
  ] as const)("%s %s %s: %d game min", (game, area, region, gameMinutes, expected) => {
    expect(convertToRealTime(game, area, region, gameMinutes)).toEqual(expected);
  });

  it("returns zero for no time", () => {
    expect(convertToRealTime("ats", "outside", "mainland", 0)).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("truncates to whole seconds instead of rounding", () => {
    // 1 game minute / 20 = 3 s exactly; 1 / 19 = 3.157... s -> 3 s
    expect(convertToRealTime("ets", "outside", "mainland", 1).seconds).toBe(3);
    // 2 / 3 * 60 = 40 s exactly; 1 / 3 * 60 = 20 s
    expect(convertToRealTime("ats", "city", "mainland", 1).seconds).toBe(20);
    // 100 / 15 * 60 = 400 s -> 6:40
    expect(convertToRealTime("ets", "outside", "uk", 100)).toEqual({
      hours: 0,
      minutes: 6,
      seconds: 40,
    });
  });

  it("never produces 60 in the minutes or seconds fields", () => {
    for (let minutes = 0; minutes <= 59 * 60 + 59; minutes += 7) {
      for (const [game, area, region] of [
        ["ats", "outside", "mainland"],
        ["ets", "outside", "uk"],
        ["ets", "outside", "mainland"],
        ["ats", "city", "mainland"],
      ] as const) {
        const d = convertToRealTime(game, area, region, minutes);
        expect(d.minutes).toBeLessThan(60);
        expect(d.seconds).toBeLessThan(60);
      }
    }
  });
});

describe("formatDuration", () => {
  it.each([
    [{ hours: 0, minutes: 0, seconds: 0 }, "0:00:00"],
    [{ hours: 1, minutes: 5, seconds: 9 }, "1:05:09"],
    [{ hours: 12, minutes: 34, seconds: 56 }, "12:34:56"],
    [{ hours: 333, minutes: 0, seconds: 0 }, "333:00:00"],
  ])("%o -> %s", (duration, expected) => {
    expect(formatDuration(duration)).toBe(expected);
  });
});
