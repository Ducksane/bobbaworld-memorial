"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  BADGES,
  getBadges,
  getServerBadges,
  subscribeToBadges,
} from "@/lib/badges";

/**
 * The visitor's badge tally, in the footer. It stays out of sight until the
 * first badge is earned, so the easter eggs are not given away up front.
 * Badges still to find show as empty frames, their names withheld.
 */
export function BadgeShelf() {
  const t = useTranslations("Badges");
  const found = useSyncExternalStore(subscribeToBadges, getBadges, getServerBadges);

  if (found.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 font-pixel text-[10px] uppercase tracking-[.16em] text-cream/55">
      <span>{t("tally", { found: found.length, total: BADGES.length })}</span>
      <ul className="flex gap-1.5">
        {BADGES.map((id) => {
          const earned = found.includes(id);
          const name = earned ? t(`names.${id}`) : t("unknown");

          return (
            <li
              key={id}
              title={name}
              className={
                earned
                  ? "size-2.5 bg-lime shadow-[0_0_10px_rgba(108,194,74,.6)]"
                  : "size-2.5 border border-cream/25"
              }
            >
              <span className="sr-only">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
