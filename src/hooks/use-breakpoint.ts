import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1024;

function getBreakpoint(width: number): Breakpoint {
  if (width < MOBILE_BREAKPOINT) return "mobile";
  if (width < TABLET_BREAKPOINT) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const updateBreakpoint = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };
    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}
