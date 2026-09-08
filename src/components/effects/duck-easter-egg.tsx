"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useTranslations } from "next-intl";

/** Seconds of *visible* page time before the duck first shows up. */
const FIRST_VISIT: readonly [number, number] = [45, 90];
/** Seconds between later appearances. */
const NEXT_VISIT: readonly [number, number] = [70, 140];
/** How long the duck stays out. Drives both the timer and the peek animation. */
const PEEK_MS = 9000;
/**
 * How long the quack has the stage to itself before the page reacts. The
 * audible part of `duck.mp3` runs about 450ms; the rest of the file is silence.
 */
const QUACK_MS = 500;
/** How long the page rattles once the quack has landed. Matches `bwShake`. */
const SHAKE_MS = 700;
/** The duck's escape once the shower starts. Matches `bwDuckPoof`. */
const LEAVE_MS = 380;
/** How long the meteor shower keeps falling. */
const SHOWER_MS = 15000;
/** Streaks in the shower. Enough to keep the sky busy for the whole run. */
const SHOWER_SIZE = 90;
/** How long a single streak takes to cross, in seconds. */
const STREAK_SECONDS: readonly [number, number] = [0.85, 1.7];

/** Same star palette as the background sky. */
const STAR_COLORS = [
  "#ece8dc",
  "#ece8dc",
  "#ece8dc",
  "#9fdcdc",
  "#6cc24a",
  "#e9a9c9",
];

/**
 * Where the duck can peek in from. `out` and `rest` are offsets of its own
 * width — hidden past the edge, then resting with most of its body still off
 * screen — and the tilt leans it into the page. Bottom corners sit well above
 * the audio player.
 */
const CORNERS = [
  { place: "top-[12vh] left-0", out: "-100%", rest: "-36%", tilt: "8deg", flip: false },
  { place: "top-[12vh] right-0", out: "100%", rest: "36%", tilt: "-8deg", flip: true },
  { place: "bottom-[24vh] left-0", out: "-100%", rest: "-36%", tilt: "8deg", flip: false },
  { place: "bottom-[24vh] right-0", out: "100%", rest: "36%", tilt: "-8deg", flip: true },
] as const;

type Visit = {
  corner: number;
  /** Set once the quack has been answered: the duck is on its way out. */
  leaving: boolean;
};

type ShootingStar = {
  left: string;
  top: string;
  length: number;
  angle: number;
  color: string;
  duration: string;
  delay: string;
  travelX: string;
  travelY: string;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion`; assumes motion is fine while rendering on the server. */
function useMotionAllowed() {
  return !useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function randomBetween([min, max]: readonly [number, number]) {
  return min + Math.random() * (max - min);
}

function buildShower(): ShootingStar[] {
  return Array.from({ length: SHOWER_SIZE }, () => {
    const angle = randomBetween([16, 42]);
    const travel = randomBetween([45, 80]);

    return {
      left: `${randomBetween([-10, 70]).toFixed(0)}%`,
      top: `${randomBetween([-15, 60]).toFixed(0)}%`,
      length: Math.round(randomBetween([80, 200])),
      angle,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      duration: `${randomBetween(STREAK_SECONDS).toFixed(2)}s`,
      // Spread across the whole run, less the time the last streak needs to
      // finish, so the rain keeps falling instead of arriving all at once.
      delay: `${randomBetween([0, SHOWER_MS / 1000 - STREAK_SECONDS[1]]).toFixed(2)}s`,
      travelX: `${travel.toFixed(0)}vw`,
      // Keeps the streak travelling roughly along the angle it is drawn at.
      travelY: `${(travel * Math.tan((angle * Math.PI) / 180) * 0.85).toFixed(0)}vh`,
    };
  });
}

/**
 * Easter egg: after a long enough stay, a rubber duck leans in from a random
 * corner. Clicking it plays the quack; the page then rattles and the duck bolts
 * with it; and once the rattle dies down a long meteor shower crosses the sky.
 *
 * The wait only advances while the tab is actually on screen, so a page left in
 * a background tab does not burn through it.
 */
export function DuckEasterEgg() {
  const t = useTranslations("Duck");
  const quackRef = useRef<HTMLAudioElement>(null);
  /** Whatever is due next for the duck: its retreat, or its exit after a quack. */
  const scheduleRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [visit, setVisit] = useState<Visit | null>(null);
  // Carries an id so a second quack remounts the overlay: reusing the same
  // elements would leave their finished animations in place.
  const [burst, setBurst] = useState<{ id: number; stars: ShootingStar[] } | null>(
    null,
  );
  // Reduced motion drops the peek and the shower, but the duck still quacks.
  const motionOk = useMotionAllowed();

  useEffect(() => {
    let waited = 0;
    let target = randomBetween(FIRST_VISIT);

    const tick = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      waited += 1;
      if (waited < target) return;

      waited = 0;
      target = randomBetween(NEXT_VISIT);
      setVisit({
        corner: Math.floor(Math.random() * CORNERS.length),
        leaving: false,
      });
      scheduleRef.current = setTimeout(() => setVisit(null), PEEK_MS);
    }, 1000);

    return () => {
      clearInterval(tick);
      clearTimeout(scheduleRef.current);
    };
  }, []);

  // Takes the duck off the page once its escape has played out.
  useEffect(() => {
    if (!visit?.leaving) return;

    const gone = setTimeout(() => setVisit(null), LEAVE_MS);
    return () => clearTimeout(gone);
  }, [visit]);

  // Clears the shower once it has run its course.
  useEffect(() => {
    if (!burst) return;

    const settle = setTimeout(() => setBurst(null), SHOWER_MS);
    return () => clearTimeout(settle);
  }, [burst]);

  useEffect(
    () => () => {
      delete document.documentElement.dataset.quack;
    },
    [],
  );

  const quack = () => {
    const audio = quackRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }

    // The duck now leaves on the quack's schedule, not the peek timer's.
    clearTimeout(scheduleRef.current);

    if (!motionOk) {
      setVisit(null);
      return;
    }

    // Three beats: the quack lands, then the page rattles and the duck bolts
    // with it, and only once the rattle dies down does the sky open.
    scheduleRef.current = setTimeout(() => {
      // Dropping the flag, flushing layout, then setting it again restarts the
      // shake; without the flush the browser keeps the finished animation.
      delete document.documentElement.dataset.quack;
      void document.body.offsetWidth;
      document.documentElement.dataset.quack = "";
      setVisit((current) => (current ? { ...current, leaving: true } : null));

      scheduleRef.current = setTimeout(() => {
        delete document.documentElement.dataset.quack;
        setBurst({ id: Date.now(), stars: buildShower() });
      }, SHAKE_MS);
    }, QUACK_MS);
  };

  const spot = visit === null ? null : CORNERS[visit.corner];

  return (
    <>
      <audio ref={quackRef} src="/audio/duck.mp3" preload="auto" />

      {visit && spot && (
        // Clipping the overlay keeps the half-off-screen duck from widening the
        // page; the duck itself takes pointer events back.
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          <button
            type="button"
            onClick={quack}
            aria-label={t("label")}
            title={t("label")}
            className={`absolute ${spot.place} size-[clamp(88px,11vw,132px)] cursor-pointer border-0 bg-transparent p-0 ${
              visit.leaving
                ? "pointer-events-none animate-duck-poof"
                : `pointer-events-auto ${motionOk ? "animate-duck-peek" : ""}`
            }`}
            style={
              {
                "--bw-duck-out": spot.out,
                "--bw-duck-in": spot.rest,
                "--bw-duck-tilt": spot.tilt,
                animationDuration: visit.leaving ? undefined : `${PEEK_MS}ms`,
                transform:
                  motionOk || visit.leaving
                    ? undefined
                    : `translateX(${spot.rest}) rotate(${spot.tilt})`,
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative
                pixel art that must not be resampled by the image optimiser */}
            <img
              src="/images/duck.png"
              alt=""
              width={256}
              height={256}
              className={`block size-full [image-rendering:pixelated] ${spot.flip ? "-scale-x-100" : ""}`}
            />
          </button>
        </div>
      )}

      {burst && (
        <div
          key={burst.id}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
        >
          {burst.stars.map((star, index) => (
            <span
              key={index}
              className="absolute h-px animate-shoot-burst"
              style={
                {
                  left: star.left,
                  top: star.top,
                  width: star.length,
                  rotate: `${star.angle}deg`,
                  background: `linear-gradient(90deg, rgba(236,232,220,0), ${star.color})`,
                  animationDuration: star.duration,
                  animationDelay: star.delay,
                  "--bw-shoot-x": star.travelX,
                  "--bw-shoot-y": star.travelY,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
