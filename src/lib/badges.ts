/**
 * Badges: one per easter egg, earned the first time it is found and kept in
 * `localStorage`. The footer shows the tally, a toast announces each new one.
 */
export const BADGES = [
  "duck",
  "comet",
  "constellation",
  "aurora",
  "star",
  "staff",
  "chat",
  "summon",
  "bobba",
  "flood",
  "blackout",
  "queue",
] as const;

export type BadgeId = (typeof BADGES)[number];

/**
 * Badges earned in the chat, which opens by typing: a phone or tablet with no
 * keyboard has nothing to type with.
 */
const NEEDS_KEYBOARD: readonly BadgeId[] = ["chat", "summon", "bobba", "flood"];
/** Badges for the sky's visual events, which do not run under reduced motion. */
const NEEDS_MOTION: readonly BadgeId[] = ["comet", "constellation", "aurora"];
/**
 * Bonus badges: a nice surprise, never something to hunt for. The 404's is
 * one — nothing on the site leads there. They stay out of the tally and only
 * show once earned.
 */
const BONUS: readonly BadgeId[] = ["queue"];

export function isBonus(id: BadgeId) {
  return BONUS.includes(id);
}

/** The earned badges that count towards the tally, bonus ones left out. */
export function countedBadges(found: readonly BadgeId[]) {
  return found.filter((id) => !isBonus(id));
}

/**
 * The badges the tally counts on this device: those this visitor can actually
 * earn here, so nobody is sent looking for one they can never find, and never
 * the bonus ones. A badge already earned always counts. Browser-only: call it
 * from an effect or an event handler.
 */
export function reachableBadges(found: readonly BadgeId[] = getBadges()) {
  // A mouse or trackpad means a computer, and so a keyboard; a touch screen
  // alone does not.
  const keyboard = window.matchMedia("(any-pointer: fine)").matches;
  const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return BADGES.filter(
    (id) =>
      !isBonus(id) &&
      (found.includes(id) ||
        ((keyboard || !NEEDS_KEYBOARD.includes(id)) &&
          (motion || !NEEDS_MOTION.includes(id)))),
  );
}

const STORAGE_KEY = "bw-badges";
const NONE: readonly BadgeId[] = [];

let cache: readonly BadgeId[] | undefined;
const changeListeners = new Set<() => void>();
const awardListeners = new Set<(id: BadgeId) => void>();
/**
 * Badges earned while nothing was listening — such as the 404's, granted as
 * the page mounts, before the toast has subscribed. Announced to the first
 * listener that comes along.
 */
let unannounced: BadgeId[] = [];

function read(): readonly BadgeId[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return NONE;
    return BADGES.filter((id) => parsed.includes(id));
  } catch {
    return NONE;
  }
}

/** Snapshot for `useSyncExternalStore`; the same array until a badge is earned. */
export function getBadges(): readonly BadgeId[] {
  cache ??= read();
  return cache;
}

export function getServerBadges(): readonly BadgeId[] {
  return NONE;
}

export function subscribeToBadges(onChange: () => void) {
  // Another tab earning a badge shows up here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = undefined;
    onChange();
  };

  changeListeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    changeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Called once for each badge, the moment it is first earned — or, for a badge
 * earned before anyone listened, as soon as the listener is added.
 */
export function onBadgeAwarded(listener: (id: BadgeId) => void) {
  awardListeners.add(listener);
  const missed = unannounced;
  unannounced = [];
  for (const id of missed) listener(id);
  return () => {
    awardListeners.delete(listener);
  };
}

/** Grants a badge. Does nothing if it has already been earned. */
export function awardBadge(id: BadgeId) {
  const current = getBadges();
  if (current.includes(id)) return;

  cache = BADGES.filter((badge) => badge === id || current.includes(badge));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private browsing or a full quota: the badge still counts for this visit.
  }
  for (const listener of changeListeners) listener();
  if (awardListeners.size === 0) unannounced.push(id);
  for (const listener of awardListeners) listener(id);
}
