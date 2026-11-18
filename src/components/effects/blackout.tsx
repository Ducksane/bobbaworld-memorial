"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motionAllowed } from "@/hooks/use-motion-allowed";
import { awardBadge } from "@/lib/badges";
import { playSfx } from "@/lib/sfx";

const TRIGGER_EVENT = "bw:blackout";
/** Set once the anniversary blackout has played, so it does not replay on every page. */
const SESSION_KEY = "bw-blackout";

/** The page stays dark this long before the first star comes back. */
const DARK_MS = 3600;
/** The stars return one by one; the longest wait is `RELIGHT_SECONDS` in `StarField`. */
const RELIGHT_MS = 3400;
/** The page fades back in. Matches `bwLightsOn`. */
const LIGHTS_ON_MS = 1600;
/** How long after landing the anniversary blackout waits. */
const ANNIVERSARY_DELAY_MS = 2500;

/** `off` cuts the lights, `relight` brings the stars back, `on` brings the page back. */
type Phase = "off" | "relight" | "on";

function isAnniversary() {
  const today = new Date();
  return today.getMonth() === 3 && today.getDate() === 24;
}

/**
 * Easter egg: the blackout of 24 April 2013, when BobbaWorld went dark in
 * support of a fellow server. The lights cut out, the stars go with them, then
 * the sky comes back on star by star and the page follows.
 *
 * Set off by `BlackoutTrigger` on the timeline, and once per visit on every
 * 24 April. The dimming itself is CSS, keyed on `<html data-blackout>`.
 */
export function Blackout() {
  const t = useTranslations("Blackout");
  const [phase, setPhase] = useState<Phase | null>(null);
  const running = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const enter = (next: Phase | null) => {
      if (next) root.dataset.blackout = next;
      else delete root.dataset.blackout;
      setPhase(next);
    };

    /** `unprompted` for the anniversary blackout, which nobody clicked for. */
    const run = (unprompted: boolean) => {
      if (running.current) return;
      running.current = true;
      awardBadge("blackout");

      playSfx("blackout", { unprompted });
      enter("off");
      timers.push(
        setTimeout(() => enter("relight"), DARK_MS),
        setTimeout(() => enter("on"), DARK_MS + RELIGHT_MS),
        setTimeout(() => {
          enter(null);
          running.current = false;
        }, DARK_MS + RELIGHT_MS + LIGHTS_ON_MS),
      );
    };

    const onTrigger = () => run(false);
    window.addEventListener(TRIGGER_EVENT, onTrigger);

    // Nobody asked for the anniversary one, so it stays away under reduced motion.
    if (isAnniversary() && motionAllowed()) {
      timers.push(
        setTimeout(() => {
          try {
            if (sessionStorage.getItem(SESSION_KEY)) return;
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // No session storage: skip it rather than replay it on every page.
            return;
          }
          run(true);
        }, ANNIVERSARY_DELAY_MS),
      );
    }

    return () => {
      window.removeEventListener(TRIGGER_EVENT, onTrigger);
      timers.forEach(clearTimeout);
      delete root.dataset.blackout;
      running.current = false;
    };
  }, []);

  if (phase !== "off") return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-0 z-30 grid place-items-center px-6"
    >
      <div className="flex animate-blackout-note flex-col items-center gap-4 text-center">
        <p className="flex items-center gap-2.5 font-pixel text-[10px] uppercase tracking-[.2em] text-cream/70">
          <span aria-hidden className="size-[7px] animate-blink bg-ember" />
          {t("label")}
        </p>
        <p className="max-w-[440px] font-display text-[clamp(20px,2.4vw,26px)] leading-[1.3] tracking-[-.01em] text-balance text-paper">
          {t("text")}
        </p>
      </div>
    </div>
  );
}

/**
 * The timeline dot of the blackout entry. It looks like the other quiet dots,
 * save for a slow red pulse; pressing it cuts the lights.
 */
export function BlackoutTrigger() {
  const t = useTranslations("Blackout");

  return (
    <button
      type="button"
      data-dot
      onClick={() => window.dispatchEvent(new Event(TRIGGER_EVENT))}
      aria-label={t("trigger")}
      title={t("trigger")}
      // The pseudo-element widens the 5px diamond into a comfortable target.
      className="absolute top-[9px] -left-[31px] size-[5px] rotate-45 cursor-pointer border border-ember/80 bg-night p-0 transition-[background-color,box-shadow] duration-200 before:absolute before:-inset-3.5 hover:bg-ember hover:shadow-[0_0_12px_rgba(226,86,75,.8)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
    >
      <span aria-hidden className="absolute inset-0 animate-blink bg-ember/70" />
    </button>
  );
}
