import { useEffect, useRef } from "react";
import { EventSource } from "eventsource";

const API = "http://127.0.0.1:11423";

/** Subscribe to SSE events from the Rust backend. */
export function useSSE<T>(event: string, handler: (payload: T) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const source = new EventSource(`${API}/api/events`);
    const onMessage = (e: MessageEvent) => {
      try {
        handlerRef.current(JSON.parse(e.data) as T);
      } catch {
        // ignore malformed events
      }
    };
    source.addEventListener(event, onMessage as EventListener);
    return () => {
      source.removeEventListener(event, onMessage as EventListener);
      source.close();
    };
  }, [event]);
}
