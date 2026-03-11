import { useRef, useEffect } from "react";

export function useScrollToSelected(dep: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [dep]);
  return ref;
}
