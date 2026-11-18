"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BADGES, getBadges, onBadgeAwarded, type BadgeId } from "@/lib/badges";
import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { msUntilAnswerEnds, playSfx } from "@/lib/sfx";

/** How long a toast stays up. Matches `bwToast`. */
const TOAST_MS = 4600;
/** Breath between the sound that earned a badge and the badge's own chime. */
const AFTER_SOUND_MS = 180;

type Toast = {
  id: BadgeId;
  /** How many badges the visitor had once this one was earned. */
  found: number;
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

  useEffect(() => {
    const waits = new Set<ReturnType<typeof setTimeout>>();

    const stop = onBadgeAwarded((id) => {
      const toast = { id, found: getBadges().length };
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
    playSfx("badge");
    const next = setTimeout(() => setQueue((waiting) => waiting.slice(1)), TOAST_MS);
    return () => clearTimeout(next);
  }, [current]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-5 z-40 flex justify-center px-4"
    >
      {current && (
        <div
          key={current.id}
          className={`flex items-center gap-3.5 border border-lime/45 bg-[rgb(7_15_28_/_0.92)] py-3 pr-5 pl-3.5 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-[18px] ${
            motionOk ? "animate-toast" : ""
          }`}
        >
          {/* A pixel medal: a lime square with its centre punched out. */}
          <span
            aria-hidden
            className="grid size-7 flex-none place-items-center bg-lime shadow-[0_0_14px_rgba(108,194,74,.6)]"
          >
            <span className="size-2.5 bg-moss" />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-pixel text-[9px] uppercase tracking-[.18em] text-lime">
              {t("unlocked")}
            </span>
            <span className="text-[15px] leading-tight font-semibold text-paper">
              {t(`names.${current.id}`)}
            </span>
          </span>
          <span
            aria-hidden
            className="ml-2 flex-none font-pixel text-[9px] tracking-[.14em] text-cream/45"
          >
            {current.found}/{BADGES.length}
          </span>
        </div>
      )}
    </div>
  );
}
