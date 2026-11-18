"use client";

import { useRef, type CSSProperties } from "react";
import { useParallax } from "@/hooks/use-parallax";

type Star = {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: string;
  delay: string;
  /** Seconds into a relight before this star comes back on. See `Blackout`. */
  relight: string;
};

type Layer = {
  speed: number;
  stars: Star[];
};

// Same seed and generator as the prototype, so the sky is identical everywhere
// and identical between server and client render.
const SEED = 20070507;
const PALETTE = [
  "#ece8dc",
  "#ece8dc",
  "#ece8dc",
  "#ece8dc",
  "#9fdcdc",
  "#6cc24a",
  "#e9a9c9",
];
const LAYER_SPECS: ReadonlyArray<[speed: number, size: number, count: number]> =
  [
    [0.06, 1, 120],
    [0.14, 2, 70],
    [0.26, 3, 40],
  ];

/** How long the sky takes to come back on, star by star, after a blackout. */
const RELIGHT_SECONDS = 3.2;

function buildLayers(): Layer[] {
  let seed = SEED;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  return LAYER_SPECS.map(([speed, size, count]) => ({
    speed,
    stars: Array.from({ length: count }, () => ({
      x: random() * 100,
      y: random() * 100,
      size,
      color: PALETTE[Math.floor(random() * PALETTE.length)],
      duration: (2.5 + random() * 5).toFixed(2),
      delay: (-random() * 8).toFixed(2),
      // Read off the generator's state rather than drawn from it: one more
      // draw per star would move every star that follows.
      relight: (((Math.floor(seed / 4096) % 1000) / 1000) * RELIGHT_SECONDS).toFixed(2),
    })),
  }));
}

/** Exported so `StarNames` can work out where each star sits on screen. */
export const STAR_LAYERS = buildLayers();

type StarFieldProps = {
  /** 0–2; scales the number of stars per layer. */
  density?: number;
};

export function StarField({ density = 1 }: StarFieldProps) {
  return (
    <div
      aria-hidden
      data-quake
      data-sky
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {STAR_LAYERS.map((layer, index) => (
        <StarLayer key={index} layer={layer} density={density} />
      ))}
      <span
        data-star
        className="absolute top-[14%] left-[16%] h-px w-[140px] animate-shoot bg-[linear-gradient(90deg,rgba(236,232,220,0),#ece8dc)]"
        style={{ rotate: "28deg" }}
      />
    </div>
  );
}

function StarLayer({ layer, density }: { layer: Layer; density: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, -layer.speed);

  const count = Math.round(layer.stars.length * density);

  return (
    <div
      ref={ref}
      data-star-layer
      className="absolute top-0 left-0 h-[300vh] w-full will-change-transform"
    >
      {layer.stars.slice(0, count).map((star, index) => (
        <span
          key={index}
          data-star
          className="absolute"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              background: star.color,
              animation: `bwTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              "--bw-relight": `${star.relight}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
