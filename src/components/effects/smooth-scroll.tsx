"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooths wheel scrolling with Lenis, so everything tied to the scroll position
 * — the parallax sky, the timeline rail, the quote — moves continuously instead
 * of in mouse-wheel steps. Touch scrolling stays native.
 *
 * Lenis also eases the in-page anchors, and by default honours
 * `prefers-reduced-motion`: scrolling is then 1:1 and anchors jump.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, anchors: true });
    return () => lenis.destroy();
  }, []);

  return null;
}
