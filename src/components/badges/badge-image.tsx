import type { BadgeId } from "@/lib/badges";

type BadgeImageProps = {
  id: BadgeId;
  /** Not earned yet: an empty frame with a question mark, nothing given away. */
  locked?: boolean;
  className?: string;
};

/**
 * The real Habbo badge standing for one of the site's badges, an image in
 * `public/images/badges/` taken from Habbo's badge album through
 * habboassets.com. Which badge stands for which egg:
 *
 *   duck DE65L · comet US595 · constellation US760 · aurora FI528 · star US594
 *   staff ADM (the "Habbo Staff" badge, its lettering redrawn to read "Bobba
 *   Staff") · chat DE02A · summon XXX_HHCH ("Habbo X", the volunteer helpers) · bobba NO050
 *   flood US042 · blackout FRK67 · queue NB533
 */

/** Badges kept as PNG: the hand-edited staff badge and DE02A as supplied. */
const PNG: readonly BadgeId[] = ["staff", "chat"];

export function BadgeImage({ id, locked = false, className = "" }: BadgeImageProps) {
  if (locked) {
    return (
      <span className={`grid size-[50px] flex-none place-items-center ${className}`}>
        <span className="grid size-10 place-items-center border border-dashed border-cream/30 font-pixel text-[13px] text-cream/40">
          ?
        </span>
      </span>
    );
  }

  return (
    // Habbo badges come at 31, 35, 40 or 50px: each is shown at its own size,
    // centred in a 50px box, since scaling pixel art by anything else smears it.
    // eslint-disable-next-line @next/next/no-img-element -- pixel art the optimiser would blur
    <img
      src={`/images/badges/${id}.${PNG.includes(id) ? "png" : "gif"}`}
      alt=""
      className={`size-[50px] flex-none object-none [image-rendering:pixelated] ${className}`}
    />
  );
}
