"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSkyEvent } from "@/hooks/use-sky-event";
import { playSfx } from "@/lib/sfx";

/** How long a constellation stays up. Matches `bwConstellation`. */
const DURATION_MS = 15000;
/** Seconds before the first line is drawn, while the stars pop in. */
const DRAW_START = 1.2;
/** Seconds between one line starting and the next. */
const DRAW_STEP = 0.2;

type Point = readonly [x: number, y: number];

type Figure = {
  id: "duck" | "year" | "bubble";
  /** Polylines on a 100 × 100 grid; every vertex becomes a star. */
  strokes: readonly (readonly Point[])[];
  /** Stars that belong to the figure without being joined to it. */
  loose?: readonly Point[];
};

/** A digit of "2007", drawn in an 18 × 36 box whose top-left corner is `(x, 32)`. */
function digit(x: number, shape: readonly Point[]): Point[] {
  return shape.map(([dx, dy]) => [x + dx, 32 + dy]);
}

const TWO: readonly Point[] = [[0, 0], [18, 0], [18, 18], [0, 18], [0, 36], [18, 36]];
const ZERO: readonly Point[] = [[0, 0], [18, 0], [18, 36], [0, 36], [0, 0]];
const SEVEN: readonly Point[] = [[0, 0], [18, 0], [6, 36]];

const FIGURES: readonly Figure[] = [
  {
    // The rubber duck, in profile, beak to the right.
    id: "duck",
    strokes: [
      [
        [56, 22], [69, 18], [77, 28], [91, 34], [77, 39], [72, 50], [81, 64],
        [66, 80], [34, 80], [13, 50], [30, 57], [51, 45], [56, 22],
      ],
    ],
    loose: [[68, 27]],
  },
  {
    // The year it all opened.
    id: "year",
    strokes: [digit(2, TWO), digit(28, ZERO), digit(54, ZERO), digit(80, SEVEN)],
  },
  {
    // A chat bubble, three dots in the middle of a sentence.
    id: "bubble",
    strokes: [
      [
        [14, 26], [86, 26], [93, 34], [93, 58], [86, 66], [42, 66], [25, 81],
        [29, 66], [14, 66], [7, 58], [7, 34], [14, 26],
      ],
    ],
    loose: [[34, 46], [50, 46], [66, 46]],
  },
];

/** Corners of the sky a figure can appear in, clear of the audio player. */
const SPOTS = ["top-[11vh] left-[6vw]", "top-[11vh] right-[6vw]"] as const;

type Line = { from: Point; to: Point };

function linesOf(figure: Figure): Line[] {
  return figure.strokes.flatMap((stroke) =>
    stroke.slice(1).map((to, index) => ({ from: stroke[index], to })),
  );
}

function starsOf(figure: Figure): Point[] {
  const seen = new Set<string>();
  return [...figure.strokes.flat(), ...(figure.loose ?? [])].filter(([x, y]) => {
    const key = `${x}:${y}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Rolls which figure appears, and where. */
function drawScene() {
  return {
    figure: FIGURES[Math.floor(Math.random() * FIGURES.length)],
    spot: SPOTS[Math.floor(Math.random() * SPOTS.length)],
  };
}

/**
 * Sky event: a handful of stars come out, lines join them one after the other
 * into a figure, a star-chart caption names it, and it all fades.
 */
export function Constellation() {
  const t = useTranslations("Sky");
  const run = useSkyEvent("constellation", DURATION_MS, drawScene);

  // A music box chimes as the stars come out, once per run.
  const runId = run?.id;
  useEffect(() => {
    if (runId !== undefined) playSfx("constellation", { unprompted: true });
  }, [runId]);

  if (run === null) return null;

  const { figure, spot } = run.scene;
  const lines = linesOf(figure);
  const stars = starsOf(figure);
  const drawn = DRAW_START + lines.length * DRAW_STEP;

  return (
    <div
      key={run.id}
      aria-hidden
      className={`pointer-events-none fixed z-30 size-[min(50vw,330px)] animate-constellation ${spot}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
        fill="none"
      >
        {lines.map((line, index) => (
          <line
            key={index}
            x1={line.from[0]}
            y1={line.from[1]}
            x2={line.to[0]}
            y2={line.to[1]}
            // Normalising the length to 1 lets one keyframe draw every line,
            // whatever its size. The width is in grid units: about 1px on screen.
            pathLength={1}
            strokeDasharray={1}
            strokeWidth={0.3}
            className="stroke-cream/50"
            style={{
              animation: `bwDraw 0.5s ease-out ${(DRAW_START + index * DRAW_STEP).toFixed(2)}s both`,
            }}
          />
        ))}
      </svg>

      {stars.map(([x, y], index) => (
        <span
          key={`${x}:${y}`}
          className="absolute size-[3px] -translate-1/2 bg-paper shadow-[0_0_8px_1px_rgba(159,220,220,.75)]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animation: `bwStarPop 0.45s steps(3) ${(index * 0.07).toFixed(2)}s both`,
          }}
        />
      ))}

      <p
        className="absolute inset-x-0 top-full pt-2 text-center font-pixel text-[9px] uppercase tracking-[.2em] text-cream/55"
        style={{ animation: `bwRise 1.2s ease-out ${drawn.toFixed(2)}s both` }}
      >
        {t("constellation", { name: t(`figures.${figure.id}`) })}
      </p>
    </div>
  );
}
