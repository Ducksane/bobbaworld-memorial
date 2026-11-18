"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "@/components/effects/scramble-text";
import { PixelLabel } from "@/components/ui/pixel-label";
import { awardBadge } from "@/lib/badges";

/** Players the server held at its peak, when the queue had to be introduced. */
const ONLINE = 1500;
/** The place in the queue hovers just past a full server, and never gets any closer. */
const PLACES = [1, 1, 2, 1, 3, 2, 1, 2] as const;
/** Ms between one shuffle of the queue and the next. */
const SHUFFLE_MS = 2600;
/** Blocks in the progress bar. `bwQueue` lights the first ten, then starts over. */
const BLOCKS = 14;

function Blocks({ className }: { className: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: BLOCKS }, (_, block) => (
        <span key={block} className="h-2 flex-1 bg-lime" />
      ))}
    </div>
  );
}

/**
 * Easter egg on the 404 page: the waiting queue BobbaWorld needed at its
 * busiest. The server is full, the place in line shuffles back and forth and
 * the bar keeps filling without ever getting there.
 */
export function QueuePosition() {
  const t = useTranslations("NotFound.queue");
  const [step, setStep] = useState(0);

  useEffect(() => {
    awardBadge("queue");

    const shuffle = setInterval(
      () => setStep((current) => (current + 1) % PLACES.length),
      SHUFFLE_MS,
    );
    return () => clearInterval(shuffle);
  }, []);

  return (
    <div className="mt-10 max-w-[460px] animate-rise-later border border-cream/12 bg-[linear-gradient(180deg,rgba(236,232,220,.045),rgba(236,232,220,.015))] px-[26px] py-6">
      <PixelLabel dot={7} blink className="mb-4 text-[10px] tracking-[.18em] text-lime">
        <ScrambleText text={t("label")} delay={500} />
      </PixelLabel>
      <p className="text-pretty text-cream/86">
        {t.rich("position", {
          position: ONLINE + PLACES[step],
          strong: (chunks) => (
            <strong className="font-display text-[26px] leading-none font-extrabold tracking-[-.02em] text-paper tabular-nums">
              {chunks}
            </strong>
          ),
        })}
      </p>
      {/* A dim row, and a lit copy on top that is uncovered block by block. */}
      <div aria-hidden className="relative mt-5">
        <Blocks className="opacity-[.14]" />
        <Blocks className="absolute inset-0 animate-queue" />
      </div>
      <p className="mt-4 font-pixel text-[9px] uppercase tracking-[.16em] text-cream/55">
        {t("status", { online: ONLINE })}
      </p>
    </div>
  );
}
