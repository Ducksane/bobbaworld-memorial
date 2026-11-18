"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { awardBadge } from "@/lib/badges";
import { bobbaFilter } from "@/lib/bobba-filter";
import { playSfx } from "@/lib/sfx";

/** Longest line the chat bar takes. */
const MAX_LENGTH = 60;
/** A line left alone this long sends itself. */
const IDLE_SEND_MS = 2600;
/** How long a bubble takes to float away. Matches `bwBubble`. */
const BUBBLE_MS = 9000;
/** How long a bubble stays when it cannot float, under reduced motion. */
const STILL_BUBBLE_MS = 4000;

type Bubble = {
  id: number;
  text: string;
  /** Sideways nudge, in px, so consecutive bubbles do not stack in a column. */
  drift: number;
};

/** True when a key press belongs to a form control rather than to the page. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  );
}

/**
 * Easter egg: there is no text field on the page, but typing anyway opens a
 * chat bar. Enter sends the line up the screen as a speech bubble, the way
 * chat rose in a Habbo room — and, as it did on BobbaWorld, rude words come
 * out as "#&@!%".
 */
export function BobbaChat() {
  const t = useTranslations("Chat");
  const motionOk = useMotionAllowed();
  const [draft, setDraft] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // The key handler is bound once; these keep it reading the latest values.
  const draftRef = useRef("");
  const motionRef = useRef(motionOk);
  useEffect(() => {
    motionRef.current = motionOk;
  }, [motionOk]);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | undefined;
    const fading = new Set<ReturnType<typeof setTimeout>>();

    const write = (next: string) => {
      draftRef.current = next;
      setDraft(next);
    };

    const send = () => {
      clearTimeout(idle);
      const line = draftRef.current.trim();
      write("");
      if (!line) return;

      const { text, censored } = bobbaFilter(line);
      playSfx("message");
      if (censored) awardBadge("bobba");

      const id = Date.now();
      setBubbles((current) => [
        ...current,
        { id, text, drift: Math.round((Math.random() - 0.5) * 120) },
      ]);
      const gone = setTimeout(
        () => {
          fading.delete(gone);
          setBubbles((current) => current.filter((bubble) => bubble.id !== id));
        },
        motionRef.current ? BUBBLE_MS : STILL_BUBBLE_MS,
      );
      fading.add(gone);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (isTyping(event.target)) return;

      const current = draftRef.current;
      const focused = document.activeElement;
      // A control focused from the keyboard keeps Space and Enter for itself.
      const controlHasKeys =
        focused instanceof HTMLElement &&
        focused !== document.body &&
        focused.matches(":focus-visible");

      if (event.key.length === 1 && event.key !== " ") {
        // First letter of a line: a control left focused by a mouse click would
        // otherwise swallow the Space or Enter that follows.
        if (!current && focused instanceof HTMLElement && !controlHasKeys) {
          focused.blur();
        }
        write((current + event.key).slice(0, MAX_LENGTH));
      } else if (!current) {
        // Nothing typed yet: Space scrolls, Enter activates, as they always do.
        return;
      } else if (event.key === "Backspace") {
        event.preventDefault();
        write(current.slice(0, -1));
      } else if (event.key === "Escape") {
        write("");
      } else if (controlHasKeys) {
        return;
      } else if (event.key === " ") {
        event.preventDefault();
        write((current + " ").slice(0, MAX_LENGTH));
      } else if (event.key === "Enter") {
        event.preventDefault();
        send();
        return;
      } else {
        return;
      }

      clearTimeout(idle);
      if (draftRef.current) idle = setTimeout(send, IDLE_SEND_MS);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(idle);
      fading.forEach(clearTimeout);
    };
  }, []);

  if (!draft && bubbles.length === 0) return null;

  return (
    // Sits just above the audio player, which is 64px tall and 20px off the bottom.
    <div className="pointer-events-none fixed inset-x-0 bottom-[100px] z-30 flex justify-center px-4">
      {bubbles.map((bubble) => (
        <p
          key={bubble.id}
          role="status"
          className={`absolute bottom-full mb-3 max-w-[min(calc(100vw-32px),420px)] border-2 border-night bg-paper px-3 py-1.5 text-[14px] leading-[1.35] break-words text-night shadow-[3px_3px_0_rgba(5,11,22,.55)] outline outline-cream/25 ${
            motionOk ? "animate-bubble" : ""
          }`}
          style={{ marginLeft: bubble.drift }}
        >
          <b className="font-semibold">{t("you")}</b> {bubble.text}
          {/* The bubble's tail, a single stepped notch. */}
          <span
            aria-hidden
            className="absolute top-full left-5 size-1.5 border-2 border-t-0 border-night bg-paper"
          />
        </p>
      ))}

      {draft && (
        <p
          aria-hidden
          className="flex max-w-[min(calc(100vw-32px),420px)] items-center gap-2 border-2 border-night bg-paper px-3 py-1.5 text-[14px] leading-[1.35] text-night shadow-[3px_3px_0_rgba(5,11,22,.55)] outline outline-cream/25"
        >
          <span className="min-w-0 break-words whitespace-pre-wrap">
            {draft}
            <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-blink bg-night" />
          </span>
          <span className="flex-none font-pixel text-[9px] uppercase tracking-[.14em] text-night/45">
            {t("send")}
          </span>
        </p>
      )}
    </div>
  );
}
