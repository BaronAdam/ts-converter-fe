import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ResultDisplay from "./ResultDisplay";

describe("ResultDisplay", () => {
  it("pads single-digit minutes", () => {
    render(<ResultDisplay hours={1} minutes={5} />);
    expect(screen.getByText("1:05h")).toBeInTheDocument();
  });

  it("does not pad two-digit minutes", () => {
    render(<ResultDisplay hours={0} minutes={45} />);
    expect(screen.getByText("0:45h")).toBeInTheDocument();
  });
});
