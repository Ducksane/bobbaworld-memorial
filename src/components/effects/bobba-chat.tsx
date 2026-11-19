"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { awardBadge } from "@/lib/badges";
import { bobbaFilter } from "@/lib/bobba-filter";
import { playSfx } from "@/lib/sfx";
import { ChatBubble } from "./chat-bubble";
import { CAMEO_MS, cameoFor, TheStaffCameo, type Cameo } from "./thestaff-cameo";

/** Longest line the chat bar takes, as in a Habbo room. */
const MAX_LENGTH = 100;
/** A line left alone this long sends itself. */
const IDLE_SEND_MS = 2600;
/** How long a bubble takes to float away. Matches `bwBubble`. */
const BUBBLE_MS = 9000;
/** How long a bubble stays when it cannot float, under reduced motion. */
const STILL_BUBBLE_MS = 4000;
/** Flood control, as in a Habbo room: this many lines this fast… */
const FLOOD_LINES = 4;
const FLOOD_WINDOW_MS = 6000;
/** …and the chat bar stays locked this long. */
const FLOOD_MUTE_S = 10;

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
 * out as "#&@!%". Sending too many lines too fast locks the bar for a while,
 * the way Habbo's flood control did. Naming TheStaff, YingYang or Fullmoon, or just saying "staff", brings one of the team up to answer.
 */
export function BobbaChat() {
  const t = useTranslations("Chat");
  const motionOk = useMotionAllowed();
  const [draft, setDraft] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [cameo, setCameo] = useState<Cameo | null>(null);
  /** Seconds left before the chat bar unlocks; 0 when it is open. */
  const [muted, setMuted] = useState(0);

  // The key handler is bound once; these keep it reading the latest values.
  const draftRef = useRef("");
  const motionRef = useRef(motionOk);
  useEffect(() => {
    motionRef.current = motionOk;
  }, [motionOk]);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | undefined;
    let staffLeaves: ReturnType<typeof setTimeout> | undefined;
    let unmute: ReturnType<typeof setInterval> | undefined;
    /** When the chat bar unlocks, in `Date.now()` time; 0 when it is open. */
    let mutedUntil = 0;
    /** When the recent lines were sent, for flood control. */
    let sentAt: number[] = [];
    const fading = new Set<ReturnType<typeof setTimeout>>();

    const mute = () => {
      mutedUntil = Date.now() + FLOOD_MUTE_S * 1000;
      sentAt = [];
      awardBadge("flood");
      setMuted(FLOOD_MUTE_S);
      clearInterval(unmute);
      unmute = setInterval(() => {
        const left = Math.ceil((mutedUntil - Date.now()) / 1000);
        setMuted(Math.max(left, 0));
        if (left > 0) return;
        mutedUntil = 0;
        clearInterval(unmute);
      }, 250);
    };

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
      const visit = cameoFor(line);
      // A call for help rings like a new ticket on the moderators' tools, in
      // place of the usual chat sound.
      playSfx(visit?.reply === "help" ? "ticket" : "message");
      awardBadge("chat");
      if (censored) awardBadge("bobba");

      if (visit) {
        awardBadge("summon");
        // Called again during a visit: the new one starts over from the floor.
        clearTimeout(staffLeaves);
        setCameo(visit);
        staffLeaves = setTimeout(() => setCameo(null), CAMEO_MS);
      }

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

      const now = Date.now();
      sentAt = [...sentAt.filter((at) => now - at < FLOOD_WINDOW_MS), now];
      if (sentAt.length >= FLOOD_LINES) mute();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
      if (isTyping(event.target)) return;
      // Flood control: nothing gets typed until the bar unlocks.
      if (mutedUntil > Date.now()) return;

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
      clearTimeout(staffLeaves);
      clearInterval(unmute);
      fading.forEach(clearTimeout);
    };
  }, []);

  if (!draft && bubbles.length === 0 && cameo === null && muted === 0) return null;

  return (
    <>
      <TheStaffCameo cameo={cameo} motionOk={motionOk} />
      {/* Sits just above the audio player, which is 64px tall and 20px off the bottom. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[100px] z-30 flex justify-center px-4 font-chat">
        {bubbles.map((bubble) => (
          // The visitor speaks as the ghost: they have no avatar of their own.
          <ChatBubble
            key={bubble.id}
            head="/images/avatars/ghost-head.png"
            speaker={t("you")}
            text={bubble.text}
            className={`absolute bottom-full mb-3 max-w-[min(calc(100vw-32px),420px)] ${
              motionOk ? "animate-bubble" : ""
            }`}
            style={{ marginLeft: bubble.drift }}
          />
        ))}

        {/* Flood control locks the bar; otherwise it shows the line being typed. */}
        {muted > 0 && (
          <p
            role="status"
            className="flex max-w-[min(calc(100vw-32px),420px)] items-center gap-2 border-2 border-night bg-paper px-3 py-1.5 text-[14px] leading-[1.35] text-ember shadow-[3px_3px_0_rgba(5,11,22,.55)] outline outline-ember/50"
          >
            <span className="min-w-0 tabular-nums">{t("flood", { seconds: muted })}</span>
          </p>
        )}
        {muted === 0 && draft && (
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
    </>
  );
}
