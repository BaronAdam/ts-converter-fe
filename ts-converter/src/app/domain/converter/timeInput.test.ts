import { describe, expect, it } from "vitest";
import {
  normalizeHours,
  normalizeMinutes,
  stepHours,
  stepMinutes,
  toTotalMinutes,
} from "./timeInput";

describe("normalizeHours", () => {
  it.each([
    ["5", "5"],
    ["0", "0"],
    ["-3", "0"],
    ["120", "120"],
    ["5000", "999"],
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

describe("stepHours", () => {
  it.each([
    ["", 1, "1"],
    ["2", 1, "3"],
    ["0", -1, "0"],
    ["999", 1, "999"],
  ])("%j %d -> %j", (value, delta, expected) => {
    expect(stepHours(value, delta)).toBe(expected);
  });
});

describe("stepMinutes", () => {
  it.each([
    ["", 5, "5"],
    ["55", 5, "59"],
    ["3", -5, "0"],
    ["30", -5, "25"],
  ])("%j %d -> %j", (value, delta, expected) => {
    expect(stepMinutes(value, delta)).toBe(expected);
  });
});

describe("toTotalMinutes", () => {
  it.each([
    ["1", "30", 90],
    ["", "45", 45],
    ["2", "", 120],
    ["", "", 0],
    ["20", "0", 1200],
  ])("hours=%j minutes=%j -> %d", (h, m, expected) => {
    expect(toTotalMinutes(h, m)).toBe(expected);
  });
});
