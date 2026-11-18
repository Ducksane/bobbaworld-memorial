"use client";

import { useEffect, type CSSProperties } from "react";
import { useSkyEvent } from "@/hooks/use-sky-event";
import { playSfx } from "@/lib/sfx";

/** How long the aurora stays up. Matches `bwAurora`. */
const DURATION_MS = 24000;

/**
 * The curtains, back to front, in the star palette's three accents. Each sways
 * at its own pace so the folds never line up twice.
 */
const CURTAINS = [
  { rgb: "46,196,196", alpha: 0.34, top: "-22%", height: "92%", skew: "-16deg", sway: "17s", delay: "-6s" },
  { rgb: "108,194,74", alpha: 0.42, top: "-14%", height: "76%", skew: "-10deg", sway: "13s", delay: "-2s" },
  { rgb: "233,169,201", alpha: 0.24, top: "-26%", height: "70%", skew: "-20deg", sway: "21s", delay: "-11s" },
] as const;

/** Vertical folds: the mask lets the light through in uneven stripes. */
const FOLDS =
  "repeating-linear-gradient(90deg, #000 0%, rgba(0,0,0,.2) 3.5%, #000 8%, rgba(0,0,0,.45) 11%, rgba(0,0,0,.1) 15.5%, #000 21%)";

/** Sky event: northern lights ripple across the top of the page, then fade. */
export function Aurora() {
  const run = useSkyEvent("aurora", DURATION_MS);

  // A chiptune shimmer swells as the lights come up, once per run.
  const runId = run?.id;
  useEffect(() => {
    if (runId !== undefined) playSfx("aurora", { unprompted: true });
  }, [runId]);

  if (run === null) return null;

  return (
    <div
      key={run.id}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[78vh] animate-aurora overflow-hidden mix-blend-screen [mask-image:linear-gradient(to_bottom,#000_55%,rgba(0,0,0,0))]"
    >
      {CURTAINS.map((curtain) => (
        <span
          key={curtain.rgb}
          className="absolute -inset-x-[25%] blur-[26px] will-change-transform"
          style={
            {
              top: curtain.top,
              height: curtain.height,
              background: `linear-gradient(to top, rgba(${curtain.rgb},0) 0%, rgba(${curtain.rgb},${curtain.alpha}) 34%, rgba(${curtain.rgb},${curtain.alpha * 0.45}) 68%, rgba(${curtain.rgb},0) 100%)`,
              maskImage: FOLDS,
              WebkitMaskImage: FOLDS,
              animation: `bwAuroraSway ${curtain.sway} ease-in-out ${curtain.delay} infinite alternate`,
              "--bw-aurora-skew": curtain.skew,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
