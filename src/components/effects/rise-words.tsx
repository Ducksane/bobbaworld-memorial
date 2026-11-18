"use client";

import { Fragment, type CSSProperties } from "react";
import { motionAllowed } from "@/hooks/use-motion-allowed";

/**
 * Ref callback: lowers the words out of sight, then lets them rise the first
 * time the heading scrolls into view. Runs at commit time, so the words are
 * never painted in place first; without JavaScript, or under reduced motion,
 * the heading is simply shown.
 */
function attachRise(node: HTMLElement | null) {
  if (!node) return;
  if (!motionAllowed()) return;

  node.dataset.rise = "pending";
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      node.dataset.rise = "visible";
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  observer.observe(node);

  return () => {
    observer.disconnect();
    delete node.dataset.rise;
  };
}

type RiseWordsProps = {
  text: string;
  /** Ms to wait once in view, to fall in after an entrance animation. */
  delay?: number;
};

/**
 * Heading text whose words rise one after the other from behind an invisible
 * line, the first time it scrolls into view. Goes inside the heading element,
 * which keeps its own styles.
 */
export function RiseWords({ text, delay = 0 }: RiseWordsProps) {
  // Only breaking spaces split: a French quote mark keeps its non-breaking one.
  const words = text.split(" ");

  return (
    <span
      ref={attachRise}
      style={{ "--bw-rise-delay": `${delay}ms` } as CSSProperties}
    >
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          {/* Clipped rather than `overflow: hidden`, which would move the
              baseline; the clip reaches below the line for the descenders. */}
          <span className="inline-block [clip-path:inset(-30%_-15%_-18%_-15%)]">
            <span
              data-rise-word
              className="inline-block"
              style={{ "--bw-rise-index": index } as CSSProperties}
            >
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
