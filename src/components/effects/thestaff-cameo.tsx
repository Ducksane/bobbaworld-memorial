"use client";

import { useTranslations } from "next-intl";

/** How long a visit lasts: rising, waving, answering, sinking. Matches `bwStaffVisit`. */
export const CAMEO_MS = 9000;

/**
 * The team members who answer when named in the chat. Each look is a pair of
 * poses in `public/images/avatars/`, `<look>.png` standing and
 * `<look>-wave.png` waving, rendered from their Habbo figure strings and
 * served from the site rather than from Habbo. With several looks, one is
 * drawn at random for each visit.
 */
const CAMEO_CAST = [
  { name: "TheStaff", summon: /thestaff/i, looks: ["thestaff", "thestaff-2"] },
  { name: "YingYang", summon: /yingyang/i, looks: ["yingyang"] },
  { name: "Fullmoon", summon: /fullmoon/i, looks: ["fullmoon"] },
] as const;

/** "staff" on its own — not inside "TheStaff" — calls up any one of the team. */
const ANY_MEMBER = /\bstaff\b/i;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export type Cameo = {
  /** Unique per visit, so a second call restarts the animations. */
  id: number;
  name: string;
  look: string;
  /**
   * What they answer: `called` when named, `help` when the staff at large is
   * called for. Each has a few lines in `Chat.replies`, one picked per visit.
   */
  reply: "called" | "help";
  /** Picks the line, 0 to 1, rolled once so the answer holds for the visit. */
  roll: number;
};

/**
 * The visit a chat line calls for: the first team member it names, or one at
 * random when it just says "staff", in a look picked at random. `null` when it
 * calls for nobody.
 */
export function cameoFor(line: string): Cameo | null {
  const named = CAMEO_CAST.find((candidate) => candidate.summon.test(line));
  const member = named ?? (ANY_MEMBER.test(line) ? pick(CAMEO_CAST) : undefined);
  if (!member) return null;
  return {
    id: Date.now(),
    name: member.name,
    look: pick(member.looks),
    reply: named ? "called" : "help",
    roll: Math.random(),
  };
}

type TheStaffCameoProps = {
  cameo: Cameo | null;
  motionOk: boolean;
};

/**
 * Easter egg within the chat: name a member of the team, or just say "staff",
 * and one rises from the floor in the corner, waves, answers, and sinks back
 * out of sight.
 *
 * The wave shows the two poses in turn, never together: both have the same
 * body, so showing them at once would draw a second arm.
 */
export function TheStaffCameo({ cameo, motionOk }: TheStaffCameoProps) {
  const t = useTranslations("Chat");
  if (cameo === null) return null;

  const replies = t.raw(`replies.${cameo.reply}`) as string[];
  const reply = replies[Math.floor(cameo.roll * replies.length)];

  return (
    // The box's bottom edge is the floor: the avatar rises from behind it,
    // clear of the audio player (64px tall, 20px off the bottom).
    <div
      key={cameo.id}
      className="pointer-events-none fixed bottom-[96px] left-[max(12px,4vw)] z-30 h-[300px] w-[min(360px,calc(100vw-24px))] overflow-hidden"
    >
      <div
        className={`absolute bottom-0 left-0 h-[220px] w-32 ${motionOk ? "animate-staff-visit" : ""}`}
      >
        {/* Arm raised for most of each beat… */}
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel art
            that must not be resampled by the image optimiser */}
        <img
          src={`/images/avatars/${cameo.look}-wave.png`}
          alt=""
          width={128}
          height={220}
          className={`absolute inset-0 [image-rendering:pixelated] ${motionOk ? "animate-staff-arm-up" : ""}`}
        />
        {/* …and lowered for the rest. Without motion they just wave. */}
        {motionOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/avatars/${cameo.look}.png`}
            alt=""
            width={128}
            height={220}
            className="absolute inset-0 animate-staff-arm-down [image-rendering:pixelated]"
          />
        )}
      </div>

      <p
        role="status"
        className={`absolute bottom-[196px] left-[78px] w-max max-w-[min(270px,calc(100vw-110px))] border-2 border-night bg-paper px-3 py-1.5 text-[14px] leading-[1.35] text-night shadow-[3px_3px_0_rgba(5,11,22,.55)] outline outline-cream/25 ${
          motionOk ? "animate-staff-bubble" : ""
        }`}
      >
        <b className="font-semibold">{t("speaker", { name: cameo.name })}</b>{" "}
        {reply}
        {/* The bubble's tail, pointing down to the avatar's head. */}
        <span
          aria-hidden
          className="absolute top-full left-3 size-1.5 border-2 border-t-0 border-night bg-paper"
        />
      </p>
    </div>
  );
}
