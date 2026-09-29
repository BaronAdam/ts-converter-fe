import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TsConverter from ".";

const mocks = vi.hoisted(() => ({
  atsCity: vi.fn(),
  atsOutside: vi.fn(),
  etsCity: vi.fn(),
  etsMainland: vi.fn(),
  etsUk: vi.fn(),
}));

vi.mock("@/app/api/clients/AtsConvertClient", () => ({
  getAtsConvertedTimeForCity: mocks.atsCity,
  getAtsConvertedTimeForOutsideOfCity: mocks.atsOutside,
}));
vi.mock("@/app/api/clients/EtsConvertClient", () => ({
  getEtsConvertedTimeForCity: mocks.etsCity,
  getEtsConvertedTimeForOutsideOfCityMainland: mocks.etsMainland,
  getEtsConvertedTimeForOutsideOfCityUk: mocks.etsUk,
}));

const hours = () => screen.getByPlaceholderText("Hours ingame");
const minutes = () => screen.getByPlaceholderText("Minutes ingame");
const calculate = () => screen.getByRole("button", { name: "Calculate" });

beforeEach(() => {
  Object.values(mocks).forEach((m) => {
    m.mockReset();
    m.mockResolvedValue({ Hours: 1, Minutes: 5 });
  });
});

describe("TsConverter", () => {
  it("disables Calculate until something is entered", async () => {
    render(<TsConverter />);
    expect(calculate()).toBeDisabled();

    await userEvent.type(minutes(), "5");
    expect(calculate()).toBeEnabled();
  });

  it("lets the user clear an input without showing NaN", async () => {
    render(<TsConverter />);
    await userEvent.type(hours(), "3");
    await userEvent.clear(hours());

    expect(hours()).toHaveValue(null);
    expect(calculate()).toBeDisabled();
  });

  it("clamps minutes to 59", async () => {
    render(<TsConverter />);
    await userEvent.type(minutes(), "75");

    expect(minutes()).toHaveValue(59);
  });

  it("uses the ATS outside endpoint by default with total minutes", async () => {
    render(<TsConverter />);
    await userEvent.type(hours(), "1");
    await userEvent.type(minutes(), "30");
    await userEvent.click(calculate());

    expect(mocks.atsOutside).toHaveBeenCalledWith(90);
    expect(await screen.findByText("1:05h")).toBeInTheDocument();
  });

  it("uses the ATS city endpoint when the area toggle is on", async () => {
    render(<TsConverter />);
    await userEvent.type(minutes(), "10");
    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    await userEvent.click(calculate());

    expect(mocks.atsCity).toHaveBeenCalledWith(10);
  });

  it("uses ETS mainland, then UK endpoints", async () => {
    render(<TsConverter />);
    await userEvent.type(minutes(), "10");
    await userEvent.click(screen.getAllByRole("checkbox")[1]); // ETS
    await userEvent.click(calculate());
    expect(mocks.etsMainland).toHaveBeenCalledWith(10);

    await userEvent.click(screen.getAllByRole("checkbox")[2]); // UK
    await userEvent.click(calculate());
    expect(mocks.etsUk).toHaveBeenCalledWith(10);
  });

  it("shows no result when the request fails", async () => {
    mocks.atsOutside.mockResolvedValue(null);
    render(<TsConverter />);
    await userEvent.type(minutes(), "10");
    await userEvent.click(calculate());

    expect(screen.queryByText(/Real time left/)).not.toBeInTheDocument();
  });
});
