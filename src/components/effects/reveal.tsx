"use client";

import type { ReactNode } from "react";

type RevealProps = {
  as?: "div" | "li" | "blockquote";
  className?: string;
  children: ReactNode;
};

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
export function Reveal({ as: Tag = "div", className, children }: RevealProps) {
  return (
    <Tag ref={attachReveal} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
