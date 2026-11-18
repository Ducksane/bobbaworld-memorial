/**
 * The living sky, run on *visible* page time by two clocks:
 *
 * - the duck's own, so it peeks in often enough to be caught — clicking it is
 *   the only way to its badge;
 * - a shared one that, every couple of minutes, hands the stage to a single
 *   random event: an aurora, a constellation or a comet. Only one of those is
 *   ever called at a time.
 *
 * Each effect subscribes to its own kind and plays when called.
 */
export type SkyEvent = "duck" | "aurora" | "constellation" | "comet";

type Range = readonly [min: number, max: number];

/** Seconds before the duck first peeks in, then between its visits. */
const DUCK_FIRST: Range = [25, 45];
const DUCK_NEXT: Range = [60, 120];
/** When a visit falls during the blackout, the duck tries again this soon. */
const DUCK_RETRY = 5;

/** Seconds before the first sky event, then between the next ones. */
const SKY_FIRST: Range = [45, 90];
const SKY_NEXT: Range = [85, 170];

/** Relative odds of each sky event; the rarer ones stay a surprise. */
const WEIGHTS: Record<Exclude<SkyEvent, "duck">, number> = {
  comet: 3,
  constellation: 2,
  aurora: 2,
};

type Timer = { waited: number; target: number };

const listeners = new Map<SkyEvent, () => void>();
let clock: ReturnType<typeof setInterval> | undefined;
const duck: Timer = { waited: 0, target: 0 };
const sky: Timer = { waited: 0, target: 0 };
let lastSky: SkyEvent | null = null;

function randomBetween([min, max]: Range) {
  return min + Math.random() * (max - min);
}

/** Advances a timer by one second; true when it is due, and then rearms it. */
function due(timer: Timer, next: Range) {
  timer.waited += 1;
  if (timer.waited < timer.target) return false;
  timer.waited = 0;
  timer.target = randomBetween(next);
  return true;
}

function pickSky(): SkyEvent | null {
  let kinds = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).filter((kind) =>
    listeners.has(kind),
  );
  // Never the same event twice in a row, unless it is the only one listening.
  if (kinds.length > 1) kinds = kinds.filter((kind) => kind !== lastSky);
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

  if (due(duck, DUCK_NEXT)) {
    // The page is dark during the blackout: the duck waits for the lights.
    if (document.documentElement.dataset.blackout !== undefined) {
      duck.target = DUCK_RETRY;
    } else {
      listeners.get("duck")?.();
    }
  }

  if (due(sky, SKY_NEXT)) {
    const kind = pickSky();
    if (!kind) return;
    lastSky = kind;
    listeners.get(kind)?.();
  }
}

/** Registers the effect that plays `kind`. Returns the unsubscribe. */
export function onSkyEvent(kind: SkyEvent, play: () => void) {
  listeners.set(kind, play);
  if (clock === undefined) {
    Object.assign(duck, { waited: 0, target: randomBetween(DUCK_FIRST) });
    Object.assign(sky, { waited: 0, target: randomBetween(SKY_FIRST) });
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
