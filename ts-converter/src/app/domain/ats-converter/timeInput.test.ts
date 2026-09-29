import { describe, expect, it } from "vitest";
import { normalizeHours, normalizeMinutes, toTotalMinutes } from "./timeInput";

describe("normalizeHours", () => {
  it.each([
    ["5", "5"],
    ["0", "0"],
    ["-3", "0"],
    ["120", "120"],
    ["", ""],
    ["abc", ""],
  ])("%j -> %j", (input, expected) => {
    expect(normalizeHours(input)).toBe(expected);
  });
});

describe("normalizeMinutes", () => {
  it.each([
    ["30", "30"],
    ["59", "59"],
    ["60", "59"],
    ["999", "59"],
    ["-1", "0"],
    ["", ""],
    ["x", ""],
  ])("%j -> %j", (input, expected) => {
    expect(normalizeMinutes(input)).toBe(expected);
  });
});

describe("toTotalMinutes", () => {
  it.each([
    ["1", "30", 90],
    ["", "45", 45],
    ["2", "", 120],
    ["", "", 0],
    ["0", "0", 0],
  ])("hours=%j minutes=%j -> %d", (h, m, expected) => {
    expect(toTotalMinutes(h, m)).toBe(expected);
  });
});
