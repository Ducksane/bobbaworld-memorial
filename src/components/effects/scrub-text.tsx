"use client";

import { Fragment, useEffect, useRef } from "react";
import { motionAllowed } from "@/hooks/use-motion-allowed";

/** Viewport heights, from the top, between which the text goes from unread to read. */
const START = 0.92;
const END = 0.42;
/** Opacity of a word that has not been reached yet. */
const UNREAD = 0.22;
/** How many words the lit edge spreads over, so it glides rather than ticks. */
const EDGE = 3;

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

type ScrubTextProps = {
  text: string;
  className?: string;
};

/**
 * A paragraph that lights up word by word as it scrolls up the screen, and
 * dims again on the way back down. Without JavaScript, or under reduced
 * motion, it is plain text.
 */
export function ScrubText({ text, className }: ScrubTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Only breaking spaces split: a French quote mark keeps its non-breaking one.
  const words = text.split(" ");

  useEffect(() => {
    const paragraph = ref.current;
    if (!paragraph) return;
    if (!motionAllowed()) return;

    const spans = [...paragraph.querySelectorAll<HTMLElement>("[data-word]")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const top = paragraph.getBoundingClientRect().top / window.innerHeight;
      const front = clamp((START - top) / (START - END)) * (spans.length + EDGE);
      spans.forEach((span, index) => {
        const read = clamp((front - index) / EDGE);
        span.style.opacity = (UNREAD + (1 - UNREAD) * read).toFixed(3);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      for (const span of spans) span.style.opacity = "";
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span data-word className="transition-opacity duration-200 ease-linear">
            {word}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
