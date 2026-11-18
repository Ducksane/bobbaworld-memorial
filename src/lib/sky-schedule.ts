/**
 * The living sky: one shared clock that, every minute or two of *visible* page
 * time, hands the stage to a single random event — the duck, an aurora, a
 * constellation or a comet. Each effect subscribes to its own kind and plays
 * when called; only one is ever called at a time.
 */
export type SkyEvent = "duck" | "aurora" | "constellation" | "comet";

/** Seconds of visible page time before the first event. */
const FIRST_EVENT: readonly [number, number] = [45, 90];
/** Seconds between later events. Longer than the longest event, so none overlap. */
const NEXT_EVENT: readonly [number, number] = [60, 120];

/** Relative odds of each kind; the rarer ones stay a surprise. */
const WEIGHTS: Record<SkyEvent, number> = {
  duck: 3,
  comet: 3,
  constellation: 2,
  aurora: 2,
};

const listeners = new Map<SkyEvent, () => void>();
let clock: ReturnType<typeof setInterval> | undefined;
let waited = 0;
let target = 0;
let last: SkyEvent | null = null;

function randomBetween([min, max]: readonly [number, number]) {
  return min + Math.random() * (max - min);
}

function pick(): SkyEvent | null {
  let kinds = [...listeners.keys()];
  // Never the same event twice in a row, unless it is the only one listening.
  if (kinds.length > 1) kinds = kinds.filter((kind) => kind !== last);
  if (kinds.length === 0) return null;

  let roll = Math.random() * kinds.reduce((sum, kind) => sum + WEIGHTS[kind], 0);
  for (const kind of kinds) {
    roll -= WEIGHTS[kind];
    if (roll <= 0) return kind;
  }
  return kinds[kinds.length - 1];
}

function tick() {
  // A page left in a background tab does not burn through the wait.
  if (document.visibilityState !== "visible") return;
  waited += 1;
  if (waited < target) return;

  waited = 0;
  target = randomBetween(NEXT_EVENT);
  const kind = pick();
  if (!kind) return;
  last = kind;
  listeners.get(kind)?.();
}

/** Registers the effect that plays `kind`. Returns the unsubscribe. */
export function onSkyEvent(kind: SkyEvent, play: () => void) {
  listeners.set(kind, play);
  if (clock === undefined) {
    waited = 0;
    target = randomBetween(FIRST_EVENT);
    clock = setInterval(tick, 1000);
    // Lets the events be called up by hand while developing: `bwSky("aurora")`.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { bwSky?: (kind: SkyEvent) => void }).bwSky = (
        wanted,
      ) => listeners.get(wanted)?.();
    }
  }

  return () => {
    if (listeners.get(kind) === play) listeners.delete(kind);
    if (listeners.size === 0) {
      clearInterval(clock);
      clock = undefined;
    }
  };
}
