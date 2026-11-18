"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionAllowed } from "@/hooks/use-motion-allowed";

/** How far down the viewport the rail has been "read" to, as a share of its height. */
const READING_LINE = 0.62;
/** Where an entry is being read: the middle of the viewport. */
const FOCUS_LINE = 0.5;
/** How far the sky dims while a closure is being read; 1 would put it out entirely. */
const DIM_DEPTH = 0.9;
/** Px over which the sky dims on the way into a closure, and recovers on the way out. */
const DIM_EDGE = 90;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

type TimelineTrackProps = {
  /** The timeline's `<ol>`. Entries carry `data-dot` on their dot and `data-tone` when they are a closure. */
  children: ReactNode;
};

/**
 * Ties the timeline to the scroll position:
 *
 * - the rail fills with green down to the reading line, a bright pixel at its tip;
 * - each entry's dot lights up as the rail reaches it;
 * - while a closure is in the middle of the screen the stars go dim, and they
 *   come back with the entry that follows — the sky tells the story too.
 *
 * Without JavaScript, or under reduced motion, the timeline is simply fully lit.
 */
export function TimelineTrack({ children }: TimelineTrackProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    const tip = tipRef.current;
    if (!root || !fill || !tip) return;
    if (!motionAllowed()) return;

    const entries = [...root.querySelectorAll<HTMLElement>("li")].map((entry) => ({
      entry,
      dot: entry.querySelector<HTMLElement>("[data-dot]"),
      closure: entry.dataset.tone === "end",
    }));
    const sky = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = root.getBoundingClientRect();
      const readingLine = window.innerHeight * READING_LINE;
      const focusLine = window.innerHeight * FOCUS_LINE;

      const filled = Math.min(Math.max(readingLine - box.top, 0), box.height);
      fill.style.transform = `scaleY(${box.height ? filled / box.height : 0})`;
      tip.style.transform = `translateY(${filled}px)`;
      tip.style.opacity = filled > 0 && filled < box.height ? "1" : "0";

      let dim = 0;
      for (const { entry, dot, closure } of entries) {
        const lit = (dot ?? entry).getBoundingClientRect().top <= readingLine;
        entry.toggleAttribute("data-lit", lit);

        if (!closure) continue;
        const bounds = entry.getBoundingClientRect();
        // How deep the focus line sits inside the entry; negative when outside.
        const depth = Math.min(focusLine - bounds.top, bounds.bottom - focusLine);
        dim = Math.max(dim, clamp((depth + DIM_EDGE / 3) / DIM_EDGE));
      }
      sky.style.setProperty("--bw-sky", (1 - dim * DIM_DEPTH).toFixed(3));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    root.dataset.rail = "";
    fill.style.opacity = "1";
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.rail;
      sky.style.removeProperty("--bw-sky");
      for (const { entry } of entries) entry.removeAttribute("data-lit");
      fill.style.transform = "";
      fill.style.opacity = "";
      tip.style.transform = "";
      tip.style.opacity = "";
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <span
        ref={fillRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-full w-px origin-top bg-lime opacity-0 shadow-[0_0_10px_rgba(108,194,74,.55)] will-change-transform"
      />
      <span
        ref={tipRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -mt-[1.5px] -ml-px size-[3px] bg-lime-bright opacity-0 shadow-[0_0_12px_3px_rgba(131,214,96,.8)] will-change-transform"
      />
      {children}
    </div>
  );
}
