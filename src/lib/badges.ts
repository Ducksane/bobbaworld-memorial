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
  "bobba",
  "blackout",
  "queue",
] as const;

export type BadgeId = (typeof BADGES)[number];

const STORAGE_KEY = "bw-badges";
const NONE: readonly BadgeId[] = [];

let cache: readonly BadgeId[] | undefined;
const changeListeners = new Set<() => void>();
const awardListeners = new Set<(id: BadgeId) => void>();

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

/** Called once for each badge, the moment it is first earned. */
export function onBadgeAwarded(listener: (id: BadgeId) => void) {
  awardListeners.add(listener);
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
  for (const listener of awardListeners) listener(id);
}
