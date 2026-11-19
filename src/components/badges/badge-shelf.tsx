"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { BadgeImage } from "@/components/badges/badge-image";
import {
  type BadgeId,
  countedBadges,
  getBadges,
  getServerBadges,
  isBonus,
  reachableBadges,
  subscribeToBadges,
} from "@/lib/badges";

/**
 * The visitor's badge tally, in the footer. It stays out of sight until the
 * first badge is earned, so the easter eggs are not given away up front.
 * Badges still to find show as empty frames, their names withheld. Only the
 * badges this device can earn are counted: on a phone, with no keyboard for
 * the chat, the tally is shorter. Bonus badges sit apart, outside the count,
 * and only appear once earned.
 */
export function BadgeShelf() {
  const t = useTranslations("Badges");
  const found = useSyncExternalStore(subscribeToBadges, getBadges, getServerBadges);

  if (found.length === 0) return null;

  // Rendered on the client only: the server never has a badge to show.
  const reachable = reachableBadges(found);
  const bonus = found.filter(isBonus);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 font-pixel text-[10px] uppercase tracking-[.16em] text-cream/55">
      <span>{t("tally", { found: countedBadges(found).length, total: reachable.length })}</span>
      <ul className="flex gap-1.5">
        {reachable.map((id) => (
          <BadgeSquare
            key={id}
            id={id}
            kind={found.includes(id) ? "earned" : "locked"}
            name={found.includes(id) ? t(`names.${id}`) : t("unknown")}
            status={found.includes(id) ? t("unlocked") : t("locked")}
          />
        ))}
      </ul>
      {bonus.length > 0 && (
        <span className="flex items-center gap-2 text-aqua">
          <ul className="flex gap-1.5">
            {bonus.map((id) => (
              <BadgeSquare
                key={id}
                id={id}
                kind="bonus"
                name={t(`names.${id}`)}
                status={t("bonusUnlocked")}
              />
            ))}
          </ul>
          {t("bonusTally", { count: bonus.length })}
        </span>
      )}
    </div>
  );
}

const SQUARE = {
  earned: "bg-lime shadow-[0_0_10px_rgba(108,194,74,.6)]",
  locked: "border border-cream/25",
  bonus: "bg-aqua shadow-[0_0_10px_rgba(46,196,196,.6)]",
} as const;

type BadgeSquareProps = {
  id: BadgeId;
  kind: keyof typeof SQUARE;
  name: string;
  status: string;
};

/**
 * One square of the tally. Hovering it, or focusing it from the keyboard,
 * brings up a small card with the Habbo badge itself, styled like the toast
 * that announced it; a badge still to find shows a question mark, and keeps
 * its name to itself.
 */
function BadgeSquare({ id, kind, name, status }: BadgeSquareProps) {
  return (
    // The pseudo-element widens the 10px square into a comfortable target.
    <li
      tabIndex={0}
      className={`group relative size-2.5 outline-offset-4 before:absolute before:-inset-1.5 focus-visible:outline-2 focus-visible:outline-lime ${SQUARE[kind]}`}
    >
      <span className="sr-only">
        {name} — {status}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 translate-y-1 items-center gap-2.5 border border-cream/15 bg-[rgb(7_15_28_/_0.95)] py-2 pr-3.5 pl-2.5 whitespace-nowrap opacity-0 shadow-[0_12px_40px_rgba(0,0,0,.5)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        <BadgeImage id={id} locked={kind === "locked"} />
        <span className="flex flex-col gap-0.5 normal-case">
          <span
            className={`font-pixel text-[8px] uppercase tracking-[.16em] ${
              kind === "bonus" ? "text-aqua" : kind === "earned" ? "text-lime" : "text-cream/45"
            }`}
          >
            {status}
          </span>
          <span
            className={`font-sans text-[13px] leading-tight font-semibold tracking-normal ${
              kind === "locked" ? "text-cream/55" : "text-paper"
            }`}
          >
            {name}
          </span>
        </span>
      </span>
    </li>
  );
}
