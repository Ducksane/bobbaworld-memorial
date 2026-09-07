import { Bricolage_Grotesque, Figtree, Silkscreen } from "next/font/google";

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

/** Font custom properties consumed by the `font-*` utilities in `globals.css`. */
export const fontVariables = `${bricolage.variable} ${figtree.variable} ${silkscreen.variable}`;
