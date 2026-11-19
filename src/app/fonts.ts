import { Bricolage_Grotesque, Figtree, Silkscreen, Ubuntu } from "next/font/google";
import localFont from "next/font/local";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-figtree",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-silkscreen",
  display: "swap",
});

/**
 * Habbo's chat font is Sulake's take on Ubuntu, in which a few characters are
 * swapped for the pixel icons players typed with Alt codes (a star for ¥, a
 * skull for ª, music notes for —…). The chat writes in Ubuntu itself, upright,
 * and takes only those icons from Habbo's file: `habbo-chat-icons.woff2` is
 * cut down to them from the game client's font, so it weighs 4 KB.
 *
 * Only the hidden chat uses either, so neither is preloaded: they load the
 * first time the chat opens.
 */
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu",
  display: "swap",
  preload: false,
});

const habboChatIcons = localFont({
  src: "./fonts/habbo-chat-icons.woff2",
  weight: "100 900",
  variable: "--font-habbo-icons",
  display: "swap",
  preload: false,
  // No generated fallback face: it would cover every character, not just the
  // icons, and catch the text before Ubuntu could.
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+007C, U+00A5, U+00AA, U+00B1, U+00B5, U+00B6, U+00BA, U+00BB, U+00F7, U+03BC, U+2014-2015, U+2018, U+2020-2022",
    },
  ],
});

/**
 * Volter, Habbo's own pixel font (as "Goldfish", github.com/eonu/goldfish), on
 * the pixel labels.
 *
 * Like the game, it draws some characters as icons — "|" a heart, "¥" a
 * star… — so its `unicode-range` leaves those out, to Silkscreen behind it.
 * The files here are patched: "·" (empty in Volter), "—" (a music note) and
 * the arrows "→" and "↗" (missing) were drawn in on Volter's own 9-pixel grid,
 * so they line up with the letters around them.
 */
const volter = localFont({
  src: [
    { path: "./fonts/volter.woff2", weight: "400", style: "normal" },
    { path: "./fonts/volter-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-volter",
  display: "swap",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0020-007B, U+007D-007E, U+00A0-00A4, U+00A6-00A9, U+00AB-00B0, U+00B2-00B4, U+00B7-00B9, U+00BC-00F6, U+00F8-00FF, U+2013-2014, U+2019, U+2026, U+2192, U+2197",
    },
  ],
});

/** Font custom properties consumed by the `font-*` utilities in `globals.css`. */
export const fontVariables = `${bricolage.variable} ${figtree.variable} ${silkscreen.variable} ${ubuntu.variable} ${habboChatIcons.variable} ${volter.variable}`;
