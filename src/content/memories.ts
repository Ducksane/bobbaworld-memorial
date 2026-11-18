/**
 * Structural data for the memories wall. The quotes themselves live in
 * `messages/*.json` under `Memories.entries.<id>`, French first.
 *
 * To add a player: append an entry here, then add the same `id` to
 * `Memories.entries` in `messages/fr.json` and `messages/en.json`.
 */
export type Memory = {
  id: "right" | "xxbella" | "redshark";
  /** Display name. A proper noun, so it stays out of the message files. */
  pseudo: string;
  /**
   * The avatar, 64 × 110 like habbo-imaging's `size=m`: either a file in
   * `public/images/avatars/`, rendered from the player's figure string, or a
   * full habbo-imaging URL. Left out when the player has not given one; the
   * card falls back to `GHOST_AVATAR`.
   */
  avatar?: string;
  /** Year the player was around. Left out when unknown. */
  year?: string;
  /** Drives the French "Joueur"/"Joueuse" label. Masculine when left out. */
  gender?: "female";
  /** Shown instead of "Joueur"/"Player" for members of the team. */
  role?: "staff";
};

/** Blank Habbo figure, same 64x110 frame as habbo-imaging, for players with no avatar. */
export const GHOST_AVATAR = "/images/ghost.png";

export const memories: readonly Memory[] = [
  { id: "right", pseudo: "Right" },
  { id: "xxbella", pseudo: "XxbellaXx", gender: "female" },
  {
    id: "redshark",
    pseudo: "Redshark",
    role: "staff",
    avatar: "/images/avatars/redshark.png",
  },
];
