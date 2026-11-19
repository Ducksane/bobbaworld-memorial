import { isQuiet, QUIET_VOLUME } from "@/lib/player-settings";

/**
 * The site's sound effects. Each plays at its own level, turned down further
 * when the audio player is on its low-volume setting.
 *
 * Sounds the visitor did not ask for — a sky event arriving on its own, the
 * anniversary blackout — are played as `unprompted`: they stay silent while
 * the music is playing, and stop if the music starts over them. Sounds that
 * answer a click or a key, and the badge chime, always play.
 *
 * To add one, drop the file in `public/audio/sfx/` and list it here, with
 * `audibleMs`: how long it is actually heard, trailing silence left out.
 */
const SOUNDS = {
  /** The rubber duck, clicked. The file runs 2.1s, but the quack is over in 0.45s. */
  duck: { src: "/audio/duck.mp3", volume: 1, audibleMs: 450 },
  /** A chat line sent from the hidden chat bar. */
  message: { src: "/audio/sfx/message.mp3", volume: 0.7, audibleMs: 950 },
  /** A badge earned. */
  badge: { src: "/audio/sfx/badge.mp3", volume: 0.6, audibleMs: 1550 },
  /** A star clicked. */
  star: { src: "/audio/sfx/star.mp3", volume: 0.7, audibleMs: 260 },
  /** The northern lights rising. It comes unasked, so it stays soft. */
  aurora: { src: "/audio/sfx/aurora.mp3", volume: 0.4, audibleMs: 14000 },
  /** A constellation drawing itself. It comes unasked, so it stays soft. */
  constellation: { src: "/audio/sfx/constellation.mp3", volume: 0.45, audibleMs: 9600 },
  /** A moderator's new-ticket alert: a call for help, sent in the chat. */
  ticket: { src: "/audio/sfx/staff-ticket.mp3", volume: 0.7, audibleMs: 630 },
  /** The lights cutting out at the start of the blackout. */
  blackout: { src: "/audio/sfx/blackout.mp3", volume: 0.8, audibleMs: 2800 },
} as const;

export type Sfx = keyof typeof SOUNDS;

const players = new Map<Sfx, HTMLAudioElement>();
/** Unprompted sounds started and not yet over, to stop if the music starts. */
const unprompted = new Set<HTMLAudioElement>();
let musicPlaying = false;
/** When the last sound the visitor set off will have finished, in `performance.now()` time. */
let answerEndsAt = 0;

/**
 * Ms until the sound answering the visitor's last click or key is over, 0 when
 * it already is. The badge chime waits for it rather than ring over it.
 */
export function msUntilAnswerEnds() {
  return Math.max(0, answerEndsAt - performance.now());
}

/**
 * Called by the audio player as the music starts and stops. Starting it
 * silences any unprompted sound still playing.
 */
export function setMusicPlaying(playing: boolean) {
  musicPlaying = playing;
  if (!playing) return;
  for (const audio of unprompted) audio.pause();
  unprompted.clear();
}

function playerFor(name: Sfx) {
  let audio = players.get(name);
  if (!audio) {
    audio = new Audio(SOUNDS[name].src);
    audio.preload = "auto";
    players.set(name, audio);
  }
  return audio;
}

/** Fetches a sound ahead of time, so its first play is not late. */
export function preloadSfx(name: Sfx) {
  playerFor(name).load();
}

type PlayOptions = {
  /** The visitor did not cause this sound: keep it quiet under the music. */
  unprompted?: boolean;
};

/**
 * Plays a sound effect, restarting it if it is already playing. Browsers
 * refuse sound before the visitor has interacted with the page; a refused
 * sound is simply skipped.
 */
export function playSfx(name: Sfx, { unprompted: isUnprompted = false }: PlayOptions = {}) {
  if (isUnprompted && musicPlaying) return;

  const audio = playerFor(name);
  audio.volume = SOUNDS[name].volume * (isQuiet() ? QUIET_VOLUME : 1);
  audio.currentTime = 0;

  if (isUnprompted) {
    unprompted.add(audio);
    audio.addEventListener("ended", () => unprompted.delete(audio), { once: true });
  } else {
    unprompted.delete(audio);
    if (name !== "badge") {
      answerEndsAt = Math.max(answerEndsAt, performance.now() + SOUNDS[name].audibleMs);
    }
  }
  void audio.play().catch(() => {});
}
