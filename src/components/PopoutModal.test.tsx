import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PopoutModal } from "./PopoutModal";

describe("PopoutModal", () => {
  const defaultProps = {
    onClose: vi.fn(),
    header: <span>Test Header</span>,
    children: <p>Test Content</p>,
  };

  it("renders header and children", () => {
    render(<PopoutModal {...defaultProps} />);
    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<PopoutModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("\u2715"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<PopoutModal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on overlay click", () => {
    const onClose = vi.fn();
    const { container } = render(<PopoutModal {...defaultProps} onClose={onClose} />);
    const overlay = container.querySelector(".popout-overlay") as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when modal body is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<PopoutModal {...defaultProps} onClose={onClose} />);
    const modal = container.querySelector(".popout-modal") as HTMLElement;
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("has resize handle element", () => {
    const { container } = render(<PopoutModal {...defaultProps} />);
    expect(container.querySelector(".popout-modal__resize-handle")).toBeInTheDocument();
  });

  it("sets initial size from props", () => {
    const { container } = render(
      <PopoutModal {...defaultProps} initialWidth={600} initialHeight={400} />,
    );
    const modal = container.querySelector(".popout-modal") as HTMLElement;
    expect(modal.style.width).toBe("600px");
    expect(modal.style.height).toBe("400px");
  });

  it("default size is 80% of window", () => {
    Object.defineProperty(window, "innerWidth", { value: 1000, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true });

    const { container } = render(<PopoutModal {...defaultProps} />);
    const modal = container.querySelector(".popout-modal") as HTMLElement;
    expect(modal.style.width).toBe("800px");
    expect(modal.style.height).toBe("640px");
  });
});
