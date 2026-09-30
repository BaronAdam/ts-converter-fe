import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Collapsible from "./Collapsible";

const wrapper = () => screen.getByText("content").closest("[aria-hidden]") as HTMLElement;

describe("Collapsible", () => {
  it("shows its content and keeps it interactive when open", () => {
    render(
      <Collapsible open>
        <button type="button">content</button>
      </Collapsible>,
    );

    expect(wrapper()).toHaveAttribute("aria-hidden", "false");
    expect(wrapper()).not.toHaveAttribute("inert");
    expect(wrapper().className).toContain("grid-rows-[1fr]");
    expect(screen.getByRole("button", { name: "content" })).toBeInTheDocument();
  });

  it("keeps the content mounted but hidden and inert when closed", () => {
    render(
      <Collapsible open={false}>
        <button type="button">content</button>
      </Collapsible>,
    );

    // still in the DOM, so it can be seen collapsing away...
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(wrapper().className).toContain("grid-rows-[0fr]");
    expect(wrapper().className).toContain("opacity-0");
    // ...but unreachable for assistive tech, the keyboard and the mouse
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");
    expect(wrapper()).toHaveAttribute("inert");
    expect(screen.queryByRole("button", { name: "content" })).not.toBeInTheDocument();
  });

  it("animates height and opacity, and respects reduced motion", () => {
    render(<Collapsible open>content</Collapsible>);

    expect(wrapper().className).toContain("transition-[grid-template-rows,opacity]");
    expect(wrapper().className).toContain("motion-reduce:transition-none");
  });

  it("re-opens by changing the prop", () => {
    const { rerender } = render(<Collapsible open={false}>content</Collapsible>);
    expect(wrapper()).toHaveAttribute("aria-hidden", "true");

    rerender(<Collapsible open>content</Collapsible>);
    expect(wrapper()).toHaveAttribute("aria-hidden", "false");
  });
});
