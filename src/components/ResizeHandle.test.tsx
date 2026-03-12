import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ResizeHandle } from "./ResizeHandle";

describe("ResizeHandle", () => {
  it("renders with horizontal class by default", () => {
    const { container } = render(<ResizeHandle onResize={() => {}} />);
    const handle = container.firstElementChild as HTMLElement;
    expect(handle).toHaveClass("resize-handle", "resize-handle--horizontal");
  });

  it("renders with vertical class when specified", () => {
    const { container } = render(<ResizeHandle onResize={() => {}} direction="vertical" />);
    const handle = container.firstElementChild as HTMLElement;
    expect(handle).toHaveClass("resize-handle", "resize-handle--vertical");
  });

  it("has correct CSS classes", () => {
    const { container } = render(<ResizeHandle onResize={() => {}} />);
    const handle = container.firstElementChild as HTMLElement;
    expect(handle.className).toBe("resize-handle resize-handle--horizontal");
  });
});
