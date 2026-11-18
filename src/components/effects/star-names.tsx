"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { STAR_LAYERS } from "@/components/effects/star-field";
import { players, type Player } from "@/content/players";
import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { awardBadge } from "@/lib/badges";
import { playSfx } from "@/lib/sfx";

/** How close a click has to land to count as on the star, in px. */
const REACH = { mouse: 16, touch: 24 } as const;
/** How long a named star stays lit. Matches `bwStarName`. */
const FLARE_MS = 3800;
/** Anything the visitor can already act on: a click there is not a click on the sky. */
const INTERACTIVE =
  "a, button, input, select, textarea, label, summary, aside, [role='slider'], [role='button']";

type Hit = {
  /** Position in the viewport, in px. */
  x: number;
  y: number;
  size: number;
  color: string;
  /** Stable index across all layers, so a star always carries the same name. */
  index: number;
};

type Flare = Hit & {
  id: number;
  player: Player;
  /** Names near the right edge open to the left, so they stay on screen. */
  leftward: boolean;
};

/**
 * Finds the star nearest to a point. Positions are worked out from each
 * layer's box and the stars' percentages — three layout reads, not one per star.
 */
function starNear(x: number, y: number, reach: number): Hit | null {
  const layers = document.querySelectorAll<HTMLElement>("[data-star-layer]");
  let best: Hit | null = null;
  let bestDistance = reach;
  let offset = 0;

  STAR_LAYERS.forEach((layer, layerIndex) => {
    const box = layers[layerIndex]?.getBoundingClientRect();
    if (box) {
      // Stars dropped by the field's `density` are simply not in the DOM.
      const shown = layers[layerIndex].childElementCount;
      layer.stars.slice(0, shown).forEach((star, starIndex) => {
        const starX = box.left + (star.x / 100) * box.width + star.size / 2;
        const starY = box.top + (star.y / 100) * box.height + star.size / 2;
        const distance = Math.hypot(starX - x, starY - y);
        if (distance > bestDistance) return;
        bestDistance = distance;
        best = {
          x: starX,
          y: starY,
          size: star.size,
          color: star.color,
          index: offset + starIndex,
        };
      });
    }
    offset += layer.stars.length;
  });

  return best;
}

function isSky(target: EventTarget | null) {
  return !(target instanceof Element && target.closest(INTERACTIVE));
}

/**
 * Easter egg: every star in the sky stands for a player. Hovering close to one
 * frames it; clicking it makes it flare and shows whose it is. Stars that
 * belong to the staff say so, and finding one earns a badge of its own.
 */
export function StarNames() {
  const t = useTranslations("Stars");
  const motionOk = useMotionAllowed();
  const reticleRef = useRef<HTMLSpanElement>(null);
  const [flares, setFlares] = useState<Flare[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const fading = new Set<ReturnType<typeof setTimeout>>();
    let frame = 0;
    let pointer: { x: number; y: number; target: EventTarget | null } | null = null;

    // Moves the frame by hand: a state update per mouse move would be wasteful.
    const aim = (hit: Hit | null) => {
      const reticle = reticleRef.current;
      if (reticle) {
        reticle.style.opacity = hit ? "1" : "0";
        if (hit) reticle.style.translate = `${hit.x}px ${hit.y}px`;
      }
      root.style.cursor = hit ? "pointer" : "";
    };

    const track = () => {
      frame = 0;
      if (!pointer) return;
      aim(isSky(pointer.target) ? starNear(pointer.x, pointer.y, REACH.mouse) : null);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY, target: event.target };
      if (!frame) frame = requestAnimationFrame(track);
    };

    // The stars drift as the page scrolls, so a frame left behind would point at nothing.
    const onScroll = () => {
      pointer = null;
      aim(null);
    };

    const onClick = (event: MouseEvent) => {
      if (!isSky(event.target)) return;
      // Releasing a text selection is not a click on a star.
      if (!window.getSelection()?.isCollapsed) return;

      const touch = window.matchMedia("(pointer: coarse)").matches;
      const hit = starNear(event.clientX, event.clientY, touch ? REACH.touch : REACH.mouse);
      if (!hit) return;

      const player = players[hit.index % players.length];
      playSfx("star");
      awardBadge("star");
      if (player.staff) awardBadge("staff");
      const id = Date.now();
      setFlares((current) => [
        ...current,
        {
          ...hit,
          id,
          player,
          leftward: hit.x > window.innerWidth * 0.68,
        },
      ]);
      const gone = setTimeout(() => {
        fading.delete(gone);
        setFlares((current) => current.filter((flare) => flare.id !== id));
      }, FLARE_MS);
      fading.add(gone);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      if (frame) cancelAnimationFrame(frame);
      fading.forEach(clearTimeout);
      root.style.cursor = "";
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* Four corner ticks around the star under the pointer. */}
      <span
        ref={reticleRef}
        data-reticle
        className="absolute top-0 left-0 -m-[9px] size-[18px] opacity-0 transition-opacity duration-150"
      />

      {flares.map((flare) => (
        <span
          key={flare.id}
          className="absolute top-0 left-0"
          style={{ translate: `${flare.x}px ${flare.y}px` }}
        >
          <span
            className={`absolute -m-[3px] size-1.5 ${motionOk ? "animate-star-flare" : ""}`}
            style={{
              background: flare.color,
              boxShadow: `0 0 14px 3px ${flare.color}`,
            }}
          />
          {/* The sparkle's four arms. */}
          <span
            className={`absolute -mt-px -ml-[13px] h-px w-[27px] ${motionOk ? "animate-star-flare" : ""}`}
            style={{ background: flare.color }}
          />
          <span
            className={`absolute -mt-[13px] -ml-px h-[27px] w-px ${motionOk ? "animate-star-flare" : ""}`}
            style={{ background: flare.color }}
          />
          <span
            className={`absolute -top-[9px] border border-cream/20 bg-night/85 px-2 py-1 font-pixel text-[9px] whitespace-nowrap uppercase tracking-[.16em] text-paper ${
              flare.leftward ? "right-[18px]" : "left-[18px]"
            } ${motionOk ? "animate-star-name" : ""}`}
          >
            {flare.player.pseudo}
            {flare.player.staff && (
              <span className="text-lime"> · {t("staff")}</span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}
