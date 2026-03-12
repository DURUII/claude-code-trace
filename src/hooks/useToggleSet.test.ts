import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToggleSet } from "./useToggleSet";

describe("useToggleSet", () => {
  it("initial set is empty", () => {
    const { result } = renderHook(() => useToggleSet());
    expect(result.current.set.size).toBe(0);
  });

  it("toggle adds item to set", () => {
    const { result } = renderHook(() => useToggleSet());
    act(() => result.current.toggle(5));
    expect(result.current.set.has(5)).toBe(true);
    expect(result.current.set.size).toBe(1);
  });

  it("toggle removes item if already in set", () => {
    const { result } = renderHook(() => useToggleSet());
    act(() => result.current.toggle(3));
    expect(result.current.set.has(3)).toBe(true);
    act(() => result.current.toggle(3));
    expect(result.current.set.has(3)).toBe(false);
    expect(result.current.set.size).toBe(0);
  });

  it("clear empties the set", () => {
    const { result } = renderHook(() => useToggleSet());
    act(() => {
      result.current.toggle(1);
      result.current.toggle(2);
      result.current.toggle(3);
    });
    expect(result.current.set.size).toBe(3);
    act(() => result.current.clear());
    expect(result.current.set.size).toBe(0);
  });

  it("addAll adds multiple items", () => {
    const { result } = renderHook(() => useToggleSet());
    act(() => result.current.addAll([10, 20, 30]));
    expect(result.current.set.size).toBe(3);
    expect(result.current.set.has(10)).toBe(true);
    expect(result.current.set.has(20)).toBe(true);
    expect(result.current.set.has(30)).toBe(true);
  });

  it("addAll preserves existing items", () => {
    const { result } = renderHook(() => useToggleSet());
    act(() => result.current.toggle(1));
    act(() => result.current.addAll([2, 3]));
    expect(result.current.set.size).toBe(3);
    expect(result.current.set.has(1)).toBe(true);
    expect(result.current.set.has(2)).toBe(true);
    expect(result.current.set.has(3)).toBe(true);
  });
});
