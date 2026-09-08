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
  {
    id: "memorial-symphony",
    title: "BobbaWorld Memorial — Symphony",
    src: "/audio/bobbaworld-memorial-symphony.mp3",
  },
  {
    id: "just-like-you",
    title: "A Bobba Just Like You",
    src: "/audio/a-bobba-just-like-you.mp3",
  },
];
