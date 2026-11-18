"use client";

import { motionAllowed } from "@/hooks/use-motion-allowed";

/** Ms to wait once in view, so the count starts as the entry fades in. */
const DELAY_MS = 180;
/** Ms per year counted, and the bounds of the whole count. */
const PER_YEAR_MS = 110;
const MIN_MS = 450;
const MAX_MS = 1100;

const easeOut = (progress: number) => 1 - (1 - progress) ** 3;

/**
 * Ref callback: counts the year up from the previous one the first time it
 * scrolls into view. The count is drawn over the real year, which keeps its
 * place, so the layout never moves.
 */
function attachCount(node: HTMLElement | null) {
  if (!node) return;
  if (!motionAllowed()) return;

  const from = Number(node.dataset.from);
  const to = Number(node.dataset.to);
  const counter = node.querySelector<HTMLElement>("[data-counter]");
  if (!counter || !(from < to)) return;

  const duration = Math.min(Math.max((to - from) * PER_YEAR_MS, MIN_MS), MAX_MS);
  let frame = 0;
  let wait: ReturnType<typeof setTimeout>;

  const run = () => {
    node.dataset.count = "running";
    counter.textContent = String(from);
    const start = performance.now();

    const loop = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      counter.textContent = String(from + Math.round((to - from) * easeOut(progress)));
      if (progress < 1) frame = requestAnimationFrame(loop);
      else {
        delete node.dataset.count;
        counter.textContent = "";
      }
    };
    frame = requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      wait = setTimeout(run, DELAY_MS);
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  observer.observe(node);

  return () => {
    observer.disconnect();
    clearTimeout(wait);
    cancelAnimationFrame(frame);
    delete node.dataset.count;
    counter.textContent = "";
  };
}

type CountUpYearProps = {
  /** The year counted from: the previous milestone. Equal to `year` for no count. */
  from: number;
  year: string;
  dateTime: string;
  className?: string;
};

/** A timeline year that rolls up from the previous milestone as it comes into view. */
export function CountUpYear({ from, year, dateTime, className }: CountUpYearProps) {
  return (
    <time
      ref={attachCount}
      dateTime={dateTime}
      data-from={from}
      data-to={year}
      className={`relative ${className ?? ""}`}
    >
      <span data-real>{year}</span>
      <span aria-hidden data-counter className="absolute top-0 left-0" />
    </time>
  );
}
