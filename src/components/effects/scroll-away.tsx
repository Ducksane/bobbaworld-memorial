"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionAllowed } from "@/hooks/use-motion-allowed";

/** Share of the scroll offset the content lags behind by. */
const LAG = 0.3;
/** Viewport heights scrolled by the time the content has faded out entirely. */
const FADE_OVER = 0.7;

type ScrollAwayProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Lets its content trail behind the page and fade out as it is scrolled
 * away, for the hero's headline: it lingers for a moment over the sky before
 * the story takes over. Does nothing under reduced motion.
 */
export function ScrollAway({ className, children }: ScrollAwayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!motionAllowed()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / (window.innerHeight * FADE_OVER), 1);
      element.style.transform = `translate3d(0, ${(scrolled * LAG).toFixed(1)}px, 0)`;
      element.style.opacity = (1 - progress).toFixed(3);
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
      element.style.opacity = "";
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
