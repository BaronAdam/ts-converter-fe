import { describe, expect, it } from "vitest";
import {
  convertToRealTime,
  formatDuration,
  getArrival,
  toDuration,
  toSeconds,
} from "./conversion";

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

describe("toSeconds", () => {
  it("is the inverse of toDuration", () => {
    for (const seconds of [0, 1, 59, 60, 3599, 3600, 86399, 1_198_800]) {
      expect(toSeconds(toDuration(seconds))).toBe(seconds);
    }
  });
});

describe("getArrival", () => {
  const at = (h: number, m: number, s = 0) => new Date(2026, 8, 30, h, m, s).getTime();

  it("adds the real duration to the start time", () => {
    expect(getArrival(at(12, 0), { hours: 0, minutes: 4, seconds: 30 })).toEqual({
      time: "12:04:30",
      days: 0,
    });
  });

  it("rolls over the hour and pads with zeros", () => {
    expect(getArrival(at(9, 59, 58), { hours: 0, minutes: 0, seconds: 7 })).toEqual({
      time: "10:00:05",
      days: 0,
    });
  });

  it("stays on the same day up to 23:59:59", () => {
    expect(getArrival(at(12, 0), { hours: 11, minutes: 59, seconds: 59 })).toEqual({
      time: "23:59:59",
      days: 0,
    });
  });

  it("counts crossing midnight as the next day", () => {
    expect(getArrival(at(23, 59), { hours: 0, minutes: 0, seconds: 30 }).days).toBe(0);
    expect(getArrival(at(23, 59), { hours: 0, minutes: 1, seconds: 0 })).toEqual({
      time: "00:00:00",
      days: 1,
    });
  });

  it("counts calendar days, not 24-hour blocks", () => {
    // 23:00 + 26 h passes midnight twice (23:00 -> 01:00 -> the day after), i.e. 2 calendar days on
    expect(getArrival(at(23, 0), { hours: 26, minutes: 0, seconds: 0 })).toEqual({
      time: "01:00:00",
      days: 2,
    });
    expect(getArrival(at(0, 30), { hours: 23, minutes: 0, seconds: 0 })).toEqual({
      time: "23:30:00",
      days: 0,
    });
  });

  it("handles multi-day trips and month ends", () => {
    // 333 h = 13 days + 21 h, so 12:00 lands at 09:00 on day 14
    expect(getArrival(at(12, 0), { hours: 333, minutes: 0, seconds: 0 })).toEqual({
      time: "09:00:00",
      days: 14,
    });
    // 30 Sep + 1 day = 1 Oct
    expect(getArrival(at(20, 0), { hours: 5, minutes: 0, seconds: 0 }).days).toBe(1);
  });

  it("returns the start time for a zero duration", () => {
    expect(getArrival(at(8, 15, 3), { hours: 0, minutes: 0, seconds: 0 })).toEqual({
      time: "08:15:03",
      days: 0,
    });
  });
});
