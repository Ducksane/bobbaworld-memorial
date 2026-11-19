"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  countedBadges,
  getBadges,
  isBonus,
  onBadgeAwarded,
  reachableBadges,
  type BadgeId,
} from "@/lib/badges";
import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { msUntilAnswerEnds, playSfx } from "@/lib/sfx";
import { BadgeImage } from "./badge-image";

/** How long a toast stays up. Matches `bwToast`. */
const TOAST_MS = 4600;
/**
 * How long a toast stays when another badge is waiting behind it: long enough
 * for its chime to ring out, so two badges earned together follow quickly.
 */
const QUEUED_TOAST_MS = 2200;
/** Breath between the sound that earned a badge and the badge's own chime. */
const AFTER_SOUND_MS = 180;

type Toast = {
  id: BadgeId;
  /** How many badges the visitor had once this one was earned… */
  found: number;
  /** …out of how many this device can earn. */
  total: number;
};

/**
 * Announces each badge as it is earned. When earning it set off a sound —
 * the quack, a star's click, a chat line — the toast and its chime wait for
 * that sound to finish, so the two never ring together. Toasts queue up, so
 * two eggs found in quick succession are announced one after the other.
 */
export function BadgeToast() {
  const t = useTranslations("Badges");
  const motionOk = useMotionAllowed();
  const [queue, setQueue] = useState<Toast[]>([]);
  const current = queue.at(0);
  const bonus = current !== undefined && isBonus(current.id);
  const hasNext = queue.length > 1;
  /** When the current toast came up, in `performance.now()` time. */
  const shownAt = useRef(0);

  useEffect(() => {
    const waits = new Set<ReturnType<typeof setTimeout>>();

    const stop = onBadgeAwarded((id) => {
      const found = getBadges();
      const toast = {
        id,
        found: countedBadges(found).length,
        total: reachableBadges(found).length,
      };
      const enqueue = () => setQueue((waiting) => [...waiting, toast]);

      // Checked once the click or key handler that earned the badge is done,
      // so its sound counts whether it was started before the award or after.
      queueMicrotask(() => {
        const wait = msUntilAnswerEnds();
        if (wait === 0) return enqueue();
        const timer = setTimeout(() => {
          waits.delete(timer);
          enqueue();
        }, wait + AFTER_SOUND_MS);
        waits.add(timer);
      });
    });

    return () => {
      stop();
      waits.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!current) return;

    // Chimes as each toast comes up, so queued badges ring one after the other.
    shownAt.current = performance.now();
    playSfx("badge");
  }, [current]);

  // Moves on once the toast has had its time — cut short when another waits.
  useEffect(() => {
    if (!current) return;

    const hold = hasNext ? QUEUED_TOAST_MS : TOAST_MS;
    const left = Math.max(hold - (performance.now() - shownAt.current), 0);
    const next = setTimeout(() => setQueue((waiting) => waiting.slice(1)), left);
    return () => clearTimeout(next);
  }, [current, hasNext]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-5 z-40 flex justify-center px-4"
    >
      {current && (
        <div
          key={current.id}
          className={`flex items-center gap-3.5 border ${bonus ? "border-aqua/50" : "border-lime/45"} bg-[rgb(7_15_28_/_0.92)] py-3 pr-5 pl-3.5 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-[18px] ${
            motionOk ? "animate-toast" : ""
          }`}
        >
          <BadgeImage
            id={current.id}
            className={
              bonus
                ? "drop-shadow-[0_0_8px_rgba(46,196,196,.55)]"
                : "drop-shadow-[0_0_8px_rgba(108,194,74,.55)]"
            }
          />
          <span className="flex min-w-0 flex-col gap-1">
            <span
              className={`font-pixel text-[9px] uppercase tracking-[.18em] ${bonus ? "text-aqua" : "text-lime"}`}
            >
              {bonus ? t("bonusUnlocked") : t("unlocked")}
            </span>
            <span className="text-[15px] leading-tight font-semibold text-paper">
              {t(`names.${current.id}`)}
            </span>
          </span>
          <span
            aria-hidden
            className="ml-2 flex-none font-pixel text-[9px] tracking-[.14em] text-cream/45"
          >
            {bonus ? t("bonus") : `${current.found}/${current.total}`}
          </span>
        </div>
      )}
    </div>
  );
}
