"use client";

import { useSkyEvent } from "@/hooks/use-sky-event";

/** How long the comet takes to cross. Matches `bwComet`. */
const DURATION_MS = 8000;

/** Sparks shed along the tail: distance behind the head, offset across it, blink pace. */
const SPARKS = [
  { back: 46, across: -5, pace: "0.5s" },
  { back: 104, across: 4, pace: "0.7s" },
  { back: 170, across: -3, pace: "0.6s" },
] as const;

/** Rolls where the comet enters, how steeply it falls, and which way it goes. */
function drawPath() {
  return {
    top: 4 + Math.random() * 26,
    angle: 12 + Math.random() * 12,
    mirrored: Math.random() < 0.5,
  };
}

/**
 * Sky event: a single comet with a long tail drifts across the whole sky — the
 * slow counterpart to the quick streaks of the duck's meteor shower.
 */
export function Comet() {
  const run = useSkyEvent("comet", DURATION_MS, drawPath);
  if (run === null) return null;

  const { top, angle, mirrored } = run.scene;

  return (
    <div
      key={run.id}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      // Mirroring the whole sky sends the comet right to left.
      style={{ scale: mirrored ? "-1 1" : undefined }}
    >
      {/* A point on the left edge, tilted: everything below travels along its axis. */}
      <div
        className="absolute left-0 size-0"
        style={{ top: `${top.toFixed(1)}%`, rotate: `${angle.toFixed(1)}deg` }}
      >
        <div className="relative size-0 animate-comet">
          <span className="absolute top-0 right-0 h-[7px] w-[340px] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(159,220,220,0),rgba(159,220,220,.3))] blur-[4px]" />
          <span className="absolute top-0 right-0 h-px w-[340px] bg-[linear-gradient(90deg,rgba(236,232,220,0),#ece8dc)]" />
          <span className="absolute top-0 left-0 size-1 -translate-1/2 bg-paper shadow-[0_0_14px_3px_rgba(159,220,220,.85)]" />
          {SPARKS.map((spark) => (
            <span
              key={spark.back}
              className="absolute size-0.5 bg-cream"
              style={{
                right: spark.back,
                top: spark.across,
                animation: `bwBlink ${spark.pace} steps(2) infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
