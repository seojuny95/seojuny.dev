import type { Ref } from "react";

import type { Locale } from "../../../i18n/locales";
import { messages } from "../../../i18n/messages";
import { AudioIcon } from "./AudioIcon";
import type { AudioRate, AudioStatus } from "./types";

interface Props {
  duration: number;
  locale: Locale;
  onCycleRate: () => void;
  onPlayPause: () => void;
  onSkip: (delta: number) => void;
  playPauseRef?: Ref<HTMLButtonElement>;
  rate: AudioRate;
  status: AudioStatus;
  time: number;
}

export function AudioControls({
  duration,
  locale,
  onCycleRate,
  onPlayPause,
  onSkip,
  playPauseRef,
  rate,
  status,
  time,
}: Props) {
  const t = messages[locale];
  const isPlaying = status === "playing";

  return (
    <>
      <button
        ref={playPauseRef}
        type="button"
        onClick={onPlayPause}
        aria-label={
          isPlaying
            ? t.pause
            : status === "paused"
              ? t.resume
              : t.listenPostAria
        }
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors duration-300 hover:text-[var(--fg)]"
      >
        <AudioIcon name={isPlaying ? "pause" : "play"} />
        <span>
          {isPlaying ? t.pause : status === "paused" ? t.resume : t.listen}
        </span>
      </button>

      {status !== "idle" ? (
        <>
          <span className="text-[12px] text-[var(--muted)] tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={() => onSkip(-15)}
            aria-label={t.back15}
            className="inline-flex items-center gap-0.5 text-[12px] text-[var(--muted)] tabular-nums transition-colors duration-300 hover:text-[var(--fg)]"
          >
            <AudioIcon name="rewind" />
            <span>15</span>
          </button>
          <button
            type="button"
            onClick={() => onSkip(15)}
            aria-label={t.forward15}
            className="inline-flex items-center gap-0.5 text-[12px] text-[var(--muted)] tabular-nums transition-colors duration-300 hover:text-[var(--fg)]"
          >
            <span>15</span>
            <AudioIcon name="forward" />
          </button>
          <button
            type="button"
            onClick={onCycleRate}
            aria-label={t.rateAria(rate)}
            className="text-[13px] text-[var(--muted)] tabular-nums transition-colors duration-300 hover:text-[var(--fg)]"
          >
            {rate}x
          </button>
        </>
      ) : null}
    </>
  );
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) && seconds >= 0 ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
