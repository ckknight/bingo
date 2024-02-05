import * as React from "react";

export function useEventHandler(
  target: EventTarget,
  eventName: string,
  handler: (event: Event) => void,
): void {
  React.useEffect(() => {
    target.addEventListener(eventName, handler);
    return () => {
      target.removeEventListener(eventName, handler);
    };
  }, [target, eventName, handler]);
}
