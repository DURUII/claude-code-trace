import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackButton } from "./BackButton";

describe("BackButton", () => {
  it("renders with default 'Back' label", () => {
    render(<BackButton onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("\u2190 Back");
  });

  it("renders with custom label", () => {
    render(<BackButton onClick={() => {}} label="Go Home" />);
    expect(screen.getByRole("button")).toHaveTextContent("\u2190 Go Home");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<BackButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("has correct CSS class", () => {
    render(<BackButton onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveClass("message-detail__back");
  });
});
