import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertTime } from "./convert";

const mocks = vi.hoisted(() => ({
  atsCity: vi.fn(),
  atsOutside: vi.fn(),
  etsCity: vi.fn(),
  etsMainland: vi.fn(),
  etsUk: vi.fn(),
}));

vi.mock("./clients/AtsConvertClient", () => ({
  getAtsConvertedTimeForCity: mocks.atsCity,
  getAtsConvertedTimeForOutsideOfCity: mocks.atsOutside,
}));
vi.mock("./clients/EtsConvertClient", () => ({
  getEtsConvertedTimeForCity: mocks.etsCity,
  getEtsConvertedTimeForOutsideOfCityMainland: mocks.etsMainland,
  getEtsConvertedTimeForOutsideOfCityUk: mocks.etsUk,
}));

beforeEach(() => {
  Object.values(mocks).forEach((m) => {
    m.mockReset();
    m.mockResolvedValue({ Hours: 1, Minutes: 2 });
  });
});

describe("convertTime", () => {
  it.each([
    ["ats", "city", "mainland", "atsCity"],
    ["ats", "city", "uk", "atsCity"],
    ["ats", "outside", "mainland", "atsOutside"],
    ["ets", "city", "mainland", "etsCity"],
    ["ets", "city", "uk", "etsCity"],
    ["ets", "outside", "mainland", "etsMainland"],
    ["ets", "outside", "uk", "etsUk"],
  ] as const)("%s %s %s -> %s", async (game, area, region, expected) => {
    const result = await convertTime({ game, area, region, minutes: 42 });

    expect(result).toEqual({ Hours: 1, Minutes: 2 });
    expect(mocks[expected]).toHaveBeenCalledExactlyOnceWith(42);
    const others = Object.entries(mocks).filter(([name]) => name !== expected);
    others.forEach(([, m]) => expect(m).not.toHaveBeenCalled());
  });

  it("ignores the UK region for ATS", async () => {
    await convertTime({ game: "ats", area: "outside", region: "uk", minutes: 5 });

    expect(mocks.atsOutside).toHaveBeenCalledWith(5);
    expect(mocks.etsUk).not.toHaveBeenCalled();
  });
});
