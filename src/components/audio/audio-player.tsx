"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { tracks } from "@/content/tracks";

const STORAGE_KEY = "bw-player";
/** Seconds skipped per arrow key on the progress slider. */
const SEEK_STEP = 5;
/** Per-bar animation duration of the equaliser, in seconds. */
const BAR_DURATIONS = [0.9, 0.5, 1.1, 0.7];

type SavedState = {
  track: number;
  time: number;
  muted: boolean;
};

function readSavedState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { track, time, muted } = parsed as Partial<SavedState>;
    return {
      track:
        typeof track === "number" && track >= 0
          ? Math.min(track, tracks.length - 1)
          : 0,
      time: typeof time === "number" && time > 0 ? time : 0,
      muted: muted === true,
    };
  } catch {
    return null;
  }
}

function writeSavedState(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota: playback still works, it just won't resume.
  }
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "--:--";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * Sticky playlist player pinned to the bottom of every page. The track, the
 * playhead and the mute state are mirrored into `localStorage`, so navigating
 * between pages or locales picks up where the visitor left off.
 *
 * Nothing plays until the visitor presses play: browsers block autoplay with
 * sound, and a memorial page should stay quiet until it is asked not to be.
 */
export function AudioPlayer() {
  const t = useTranslations("Player");
  const audioRef = useRef<HTMLAudioElement>(null);
  /** Position to restore once the track reports its duration; cleared after seeking. */
  const resumeAt = useRef(0);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // `src` is set here rather than in JSX: assigning the attribute on every
  // render would restart the resource selection algorithm and cut playback off.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saved = readSavedState();
    resumeAt.current = saved?.time ?? 0;
    audio.src = tracks[saved?.track ?? 0].src;
    audio.muted = saved?.muted ?? false;

    setIndex(saved?.track ?? 0);
    setMuted(saved?.muted ?? false);
    setTime(resumeAt.current);
  }, []);

  const persist = (next: Partial<SavedState> = {}) => {
    const audio = audioRef.current;
    writeSavedState({
      track: index,
      time: audio?.currentTime ?? 0,
      muted: audio?.muted ?? false,
      ...next,
    });
  };

  const goToTrack = (next: number, autoplay: boolean) => {
    const audio = audioRef.current;
    setIndex(next);
    setTime(0);
    setDuration(0);
    resumeAt.current = 0;
    if (!audio) return;

    audio.src = tracks[next].src;
    audio.load();
    persist({ track: next, time: 0 });
    if (autoplay) void audio.play().catch(() => {});
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
    persist();
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    audio.currentTime = Math.min(Math.max(seconds, 0), audio.duration);
  };

  const onScrub = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    seekTo(Math.min(Math.max(ratio, 0), 1) * audio.duration);
  };

  const onScrubKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const target = {
      ArrowLeft: audio.currentTime - SEEK_STEP,
      ArrowRight: audio.currentTime + SEEK_STEP,
      Home: 0,
      End: audio.duration,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    seekTo(target);
  };

  const hasPlaylist = tracks.length > 1;
  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const timeLabel = `${formatTime(time)} / ${formatTime(duration)}`;

  return (
    <aside
      aria-label={t("label")}
      className="fixed inset-x-4 bottom-5 z-20 mx-auto flex w-[min(calc(100vw-32px),560px)] animate-player-in items-center gap-3.5 rounded-full border border-cream/14 bg-[rgb(7_15_28_/_0.78)] py-2.5 pr-[18px] pl-2.5 text-cream shadow-[0_20px_60px_rgba(0,0,0,.5),inset_0_1px_0_rgba(236,232,220,.06)] backdrop-blur-[18px] backdrop-saturate-[1.3]"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio || !Number.isFinite(audio.duration)) return;
          setDuration(audio.duration);
          if (resumeAt.current > 0) {
            audio.currentTime = Math.min(resumeAt.current, audio.duration - 1);
            resumeAt.current = 0;
          }
        }}
        onDurationChange={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setTime(audio.currentTime);
          persist();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          if (hasPlaylist) goToTrack((index + 1) % tracks.length, true);
        }}
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? t("pause") : t("play")}
        className="grid size-11 flex-none place-items-center rounded-full bg-lime text-moss transition duration-200 hover:scale-[1.04] hover:bg-lime-bright"
      >
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <rect x="3" y="2" width="4" height="12" fill="currentColor" />
            <rect x="9" y="2" width="4" height="12" fill="currentColor" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="flex size-3.5 flex-none items-end gap-0.5">
              {BAR_DURATIONS.map((barDuration, bar) => (
                <span
                  key={bar}
                  className="h-full w-0.5 origin-bottom bg-lime"
                  style={
                    playing
                      ? {
                          animation: `bwBar ${barDuration}s ease-in-out ${-bar * 0.2}s infinite`,
                        }
                      : { transform: "scaleY(.25)" }
                  }
                />
              ))}
            </span>
            <span className="truncate text-[14px] font-semibold text-paper">
              {tracks[index].title}
            </span>
          </div>
          <span className="flex-none font-pixel text-[9px] tracking-[.14em] text-cream/55">
            {timeLabel}
          </span>
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={t("position")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={timeLabel}
          onClick={onScrub}
          onKeyDown={onScrubKeyDown}
          className="relative -my-[5px] flex h-3 cursor-pointer items-center rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-lime"
        >
          <div className="relative h-0.5 w-full bg-cream/16">
            <div
              className="absolute top-0 left-0 h-full bg-lime shadow-[0_0_10px_rgba(108,194,74,.6)]"
              style={{ width: `${progress.toFixed(2)}%` }}
            />
          </div>
        </div>
      </div>

      {hasPlaylist && (
        <button
          type="button"
          onClick={() => goToTrack((index + 1) % tracks.length, playing)}
          aria-label={t("next")}
          title={t("next")}
          className="grid size-9 flex-none place-items-center rounded-full border border-cream/16 text-cream transition-colors duration-200 hover:border-lime hover:text-lime"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <path d="M3 2.5v11l7-5.5z" fill="currentColor" />
            <rect x="11.5" y="2.5" width="2" height="11" fill="currentColor" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? t("unmute") : t("mute")}
        className="grid size-9 flex-none place-items-center rounded-full border border-cream/16 text-cream transition-colors duration-200 hover:border-lime hover:text-lime"
      >
        {muted ? (
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
            <path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
            <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
            <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        )}
      </button>
    </aside>
  );
}
