import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboard } from "./useKeyboard";

function fireKey(key: string, target?: Partial<HTMLElement>) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  if (target) {
    Object.defineProperty(event, "target", { value: target });
  }
  window.dispatchEvent(event);
  return event;
}

describe("useKeyboard", () => {
  it("calls action when matching key is pressed", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ a: action }));

    fireKey("a", { tagName: "DIV", isContentEditable: false });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("prevents default on matching key", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ Enter: action }));

    const preventDefault = vi.fn();
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(event, "target", {
      value: { tagName: "DIV", isContentEditable: false },
    });
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    window.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalled();
  });

  it("does NOT call action when target is INPUT", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ a: action }));

    fireKey("a", { tagName: "INPUT", isContentEditable: false });

    expect(action).not.toHaveBeenCalled();
  });

  it("does NOT call action when target is TEXTAREA", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ a: action }));

    fireKey("a", { tagName: "TEXTAREA", isContentEditable: false });

    expect(action).not.toHaveBeenCalled();
  });

  it("does NOT call action when target is contentEditable", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ a: action }));

    fireKey("a", { tagName: "DIV", isContentEditable: true });

    expect(action).not.toHaveBeenCalled();
  });

  it("does nothing for unmapped keys", () => {
    const action = vi.fn();
    renderHook(() => useKeyboard({ a: action }));

    fireKey("b", { tagName: "DIV", isContentEditable: false });

    expect(action).not.toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const action = vi.fn();
    const { unmount } = renderHook(() => useKeyboard({ a: action }));

    unmount();

    fireKey("a", { tagName: "DIV", isContentEditable: false });

    expect(action).not.toHaveBeenCalled();
  });
});
