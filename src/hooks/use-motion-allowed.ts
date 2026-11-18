"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion`; assumes motion is fine while rendering on the server. */
export function useMotionAllowed() {
  return !useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** One-off read, for effects and event handlers. */
export function motionAllowed() {
  return !window.matchMedia(REDUCED_MOTION).matches;
}
