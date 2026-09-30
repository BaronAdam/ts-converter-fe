import { describe, expect, it } from "vitest";
import { getRate, isRegionRelevant } from "./rates";

describe("getRate", () => {
  it.each([
    ["ats", "city", "mainland", 3],
    ["ats", "outside", "mainland", 20],
    ["ets", "city", "mainland", 3],
    ["ets", "city", "uk", 3],
    ["ets", "outside", "mainland", 19],
    ["ets", "outside", "uk", 15],
  ] as const)("%s %s %s -> %d", (game, area, region, expected) => {
    expect(getRate(game, area, region)).toBe(expected);
  });
});

describe("isRegionRelevant", () => {
  it("only applies to ETS outside a city", () => {
    expect(isRegionRelevant("ets", "outside")).toBe(true);
    expect(isRegionRelevant("ets", "city")).toBe(false);
    expect(isRegionRelevant("ats", "outside")).toBe(false);
    expect(isRegionRelevant("ats", "city")).toBe(false);
  });
});
