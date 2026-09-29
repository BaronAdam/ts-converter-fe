import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as ats from "./AtsConvertClient";
import * as ets from "./EtsConvertClient";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com/");
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ Hours: 0, Minutes: 1 }),
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("convert clients", () => {
  it.each([
    ["ats city", ats.getAtsConvertedTimeForCity, "/api/convert/ats/city/42"],
    ["ats outside", ats.getAtsConvertedTimeForOutsideOfCity, "/api/convert/ats/outside/42"],
    ["ets city", ets.getEtsConvertedTimeForCity, "/api/convert/ets/city/42"],
    ["ets mainland", ets.getEtsConvertedTimeForOutsideOfCityMainland, "/api/convert/ets/outside/mainland/42"],
    ["ets uk", ets.getEtsConvertedTimeForOutsideOfCityUk, "/api/convert/ets/outside/uk/42"],
  ])("%s calls the right route", async (_name, fn, route) => {
    const result = await fn(42);

    expect(result).toEqual({ Hours: 0, Minutes: 1 });
    expect(fetchMock.mock.calls[0][0]).toBe(`https://api.example.com${route}`);
  });
});
