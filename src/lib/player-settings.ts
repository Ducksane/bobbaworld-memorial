/**
 * What the audio player remembers between visits, shared with the sound
 * effects so they follow the visitor's volume choice.
 */
export const PLAYER_STORAGE_KEY = "bw-player";

/** Volume of the player's "low" setting; the default is full volume. */
export const QUIET_VOLUME = 0.3;

/** Whether the visitor has switched the player to its low-volume setting. */
export function isQuiet() {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ?? "null");
    return (
      typeof saved === "object" &&
      saved !== null &&
      (saved as { quiet?: unknown }).quiet === true
    );
  } catch {
    return false;
  }
}
