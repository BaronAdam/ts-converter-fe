import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ToggleSwitch from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  it("swaps label text and reports the checked state", async () => {
    const callback = vi.fn();
    render(
      <ToggleSwitch labelTextInactive="Off" labelTextActive="On" callback={callback} />,
    );

    expect(screen.getByText("Off")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("On")).toBeInTheDocument();
    expect(callback).toHaveBeenLastCalledWith(true);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(callback).toHaveBeenLastCalledWith(false);
  });

  it("can be disabled", () => {
    render(<ToggleSwitch labelTextInactive="Off" labelTextActive="On" disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });
});
