"use client";

import { useEffect, type RefObject } from "react";

/**
 * Translates the referenced element vertically by `scrollY * factor`,
 * throttled to animation frames. No-op when the user prefers reduced motion.
 */
export function useParallax<T extends HTMLElement>(
  ref: RefObject<T | null>,
  factor: number,
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      element.style.transform = `translateY(${window.scrollY * factor}px)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      element.style.transform = "";
    };
  }, [ref, factor]);
}
