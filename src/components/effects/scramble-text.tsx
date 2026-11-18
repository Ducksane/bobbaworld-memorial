"use client";

import { motionAllowed } from "@/hooks/use-motion-allowed";

/** What a character flickers through before it settles. All drawn in Silkscreen. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*+=<>/?!";
/** Ms between one character starting to decode and the next. */
const STEP_MS = 30;
/** Ms a character flickers before it settles on its real value. */
const HOLD_MS = 240;
/** Ms between two glyph changes, so the flicker reads as pixel steps, not noise. */
const TICK_MS = 55;

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

/**
 * The flickering glyph over one character. Added only for the run and removed
 * as the character settles: an out-of-flow box left in the line would make
 * `innerText`, and so copy-paste, break the line after every character.
 */
function addGlyph(char: HTMLElement) {
  const glyph = document.createElement("span");
  glyph.setAttribute("aria-hidden", "true");
  glyph.className = "absolute top-0 left-0 whitespace-pre";
  char.append(glyph);
  return glyph;
}

/**
 * Ref callback: decodes the text the first time it scrolls into view. Runs at
 * commit time, so the text is hidden before it is ever painted; without
 * JavaScript, or under reduced motion, it is simply shown.
 */
function attachScramble(node: HTMLElement | null) {
  if (!node) return;
  if (!motionAllowed()) return;

  const delay = Number(node.dataset.delay ?? 0);
  const chars = [...node.querySelectorAll<HTMLElement>("[data-char]")];
  let frame = 0;

  node.dataset.scramble = "pending";

  const glyphs = new Map<HTMLElement, HTMLElement>();

  const settle = (char: HTMLElement) => {
    char.dataset.state = "done";
    glyphs.get(char)?.remove();
    glyphs.delete(char);
  };

  const run = () => {
    node.dataset.scramble = "running";
    for (const char of chars) {
      if (char.dataset.space === undefined) glyphs.set(char, addGlyph(char));
    }
    const start = performance.now() + delay;
    let lastTick = -Infinity;

    const loop = (now: number) => {
      const elapsed = now - start;
      const tick = now - lastTick >= TICK_MS;
      if (tick) lastTick = now;

      let remaining = 0;
      chars.forEach((char, index) => {
        if (char.dataset.state === "done") return;
        const begin = index * STEP_MS;

        if (elapsed >= begin + HOLD_MS || char.dataset.space !== undefined) {
          settle(char);
          return;
        }
        remaining += 1;
        const glyph = glyphs.get(char);
        if (glyph && elapsed >= begin && tick) glyph.textContent = randomGlyph();
      });

      if (remaining > 0) frame = requestAnimationFrame(loop);
      else delete node.dataset.scramble;
    };

    frame = requestAnimationFrame(loop);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      run();
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  observer.observe(node);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    delete node.dataset.scramble;
    for (const char of chars) delete char.dataset.state;
    for (const glyph of glyphs.values()) glyph.remove();
    glyphs.clear();
  };
}

type ScrambleTextProps = {
  text: string;
  /** Ms to wait once in view, to fall in after an entrance animation. */
  delay?: number;
  className?: string;
};

/**
 * Pixel-font text that decodes into place the first time it scrolls into view:
 * each character flickers through random glyphs, then settles, left to right —
 * a terminal printing the line.
 *
 * The text is split into characters once, for good, and laid out that way
 * from the first render: the flickering glyphs are drawn over each character
 * without taking any room, so the line wraps exactly the same before, during
 * and after the animation. Outside the animation the characters are plain
 * inline text, which screen readers, search engines and copy-paste read as the
 * line they form.
 */
export function ScrambleText({ text, delay = 0, className }: ScrambleTextProps) {
  return (
    <span ref={attachScramble} data-delay={delay} className={className}>
      {[...text].map((char, index) => (
        <span
          key={index}
          data-char
          data-space={char.trim() === "" ? "" : undefined}
          className="relative"
        >
          <span>{char}</span>
        </span>
      ))}
    </span>
  );
}
