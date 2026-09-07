/**
 * Playlist for the sticky audio player. Titles are proper names, so they stay
 * out of `messages/*.json`; the player's control labels live there under `Player`.
 */
export type Track = {
  id: string;
  title: string;
  src: string;
};

export const tracks: readonly Track[] = [
  {
    id: "memorial",
    title: "BobbaWorld Memorial",
    src: "/audio/bobbaworld-memorial.mp3",
  },
];
