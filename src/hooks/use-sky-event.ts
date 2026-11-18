"use client";

import { useEffect, useState } from "react";
import { awardBadge } from "@/lib/badges";
import { onSkyEvent, type SkyEvent } from "@/lib/sky-schedule";

type Run<Scene> = {
  /** Unique per run: use it as a `key` so each run restarts its animations. */
  id: number;
  scene: Scene;
};

const noScene = () => undefined;

/**
 * Subscribes a purely visual sky event to the shared clock. Returns the run in
 * progress, or `null` while the sky is quiet. Seeing the event earns its badge.
 *
 * `draw` rolls whatever is random about a run — a corner, an angle — once, as
 * the run starts. It must be a stable reference, such as a module-level function.
 */
export function useSkyEvent<Scene = undefined>(
  kind: Exclude<SkyEvent, "duck">,
  durationMs: number,
  draw: () => Scene = noScene as () => Scene,
): Run<Scene> | null {
  const [run, setRun] = useState<Run<Scene> | null>(null);

  useEffect(() => {
    let over: ReturnType<typeof setTimeout>;

    const stop = onSkyEvent(kind, () => {
      setRun({ id: Date.now(), scene: draw() });
      awardBadge(kind);
      clearTimeout(over);
      over = setTimeout(() => setRun(null), durationMs);
    });

    return () => {
      stop();
      clearTimeout(over);
    };
  }, [kind, durationMs, draw]);

  return run;
}
