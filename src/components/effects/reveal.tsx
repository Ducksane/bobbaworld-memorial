"use client";

import type { ReactNode } from "react";

type RevealProps = {
  as?: "div" | "li" | "blockquote";
  className?: string;
  /**
   * Staggers the reveal by column: in a multi-column wall, cards that come into
   * view together then arrive left to right instead of all at once.
   */
  cascade?: boolean;
  children: ReactNode;
  /** Data attributes are passed through, for styles and scripts to hook onto. */
  [data: `data-${string}`]: string | undefined;
};

/** Delay added per column of a cascading wall, in ms. */
const CASCADE_STEP_MS = 140;

/**
 * Ref callback: hides the element until it first enters the viewport.
 * Runs at commit time, so hidden elements never flash before observing.
 * Without JavaScript the element simply stays visible.
 */
function attachReveal(node: HTMLElement | null) {
  if (!node) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  node.dataset.reveal = "pending";
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (node.dataset.cascade !== undefined && node.offsetWidth > 0) {
          // `offsetLeft` is measured from the wall, so it gives the column.
          const column = Math.round(node.offsetLeft / node.offsetWidth);
          node.style.transitionDelay = `${column * CASCADE_STEP_MS}ms`;
        }
        node.dataset.reveal = "visible";
        observer.disconnect();
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  observer.observe(node);

  return () => observer.disconnect();
}

/** Fades and rises its content into view the first time it scrolls into the viewport. */
export function Reveal({
  as: Tag = "div",
  className,
  cascade = false,
  children,
  ...data
}: RevealProps) {
  return (
    <Tag
      {...data}
      ref={attachReveal}
      data-reveal=""
      data-cascade={cascade ? "" : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
