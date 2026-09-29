import { afterEach, describe, expect, it, vi } from "vitest";
import { handleTimeConverterRequest } from "./TimeConverterRequestHelper";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("handleTimeConverterRequest", () => {
  it("returns the parsed body on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ Hours: 1, Minutes: 20 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(handleTimeConverterRequest("http://x/y")).resolves.toEqual({
      Hours: 1,
      Minutes: 20,
    });
    expect(fetchMock).toHaveBeenCalledWith("http://x/y", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  });

  it("returns null on a non-ok response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(handleTimeConverterRequest("http://x/y")).resolves.toBeNull();
  });

  it("returns null when fetch rejects", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(handleTimeConverterRequest("http://x/y")).resolves.toBeNull();
  });
});
