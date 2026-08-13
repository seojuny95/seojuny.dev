import { createPortal } from "react-dom";

import type { Locale } from "../../../i18n/locales";
import { messages } from "../../../i18n/messages";
import { AudioControls } from "./AudioControls";
import { AudioIcon } from "./AudioIcon";
import { usePostAudio } from "./usePostAudio";

interface Props {
  audioSrc?: string;
  locale: Locale;
  timingSrc?: string;
}

export function PostAudioPlayer({ audioSrc, locale, timingSrc }: Props) {
  const t = messages[locale];
  const {
    audioRef,
    cycleRate,
    duration,
    inlineRef,
    jumpDirection,
    onEnded,
    onError,
    onPause,
    onPlay,
    onTimeUpdate,
    playPause,
    playPauseRef,
    playbackError,
    rate,
    resumeFollow,
    setDuration,
    showMini,
    skip,
    status,
    time,
  } = usePostAudio(timingSrc);

  if (!audioSrc) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        title={t.audioNotReady}
        className="inline-flex cursor-not-allowed items-center gap-1.5 text-[13px] text-[var(--muted)] opacity-50"
      >
        <AudioIcon name="play" />
        <span>{t.listen}</span>
      </button>
    );
  }

  const controls = {
    duration,
    locale,
    onCycleRate: cycleRate,
    onPlayPause: playPause,
    onSkip: skip,
    rate,
    status,
    time,
  };

  return (
    <>
      <div ref={inlineRef} className="flex items-center gap-4">
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={onError}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onDurationChange={(event) =>
            setDuration(event.currentTarget.duration)
          }
          className="hidden"
        />
        <AudioControls {...controls} playPauseRef={playPauseRef} />
        {playbackError ? (
          <span role="alert" className="text-[12px] text-[var(--muted)]">
            {t.audioPlaybackError}
          </span>
        ) : null}
      </div>

      {showMini && typeof document !== "undefined"
        ? createPortal(
            <div
              className="speech-mini"
              role="region"
              aria-label={t.playerAria}
            >
              <div className="speech-mini-inner">
                <AudioControls {...controls} />
              </div>
            </div>,
            document.body,
          )
        : null}

      {jumpDirection && typeof document !== "undefined"
        ? createPortal(
            <button
              type="button"
              onClick={resumeFollow}
              aria-label={t.jumpToCurrentAria}
              className={`speech-jump speech-jump-${jumpDirection}`}
            >
              <span aria-hidden className="speech-jump-arrow">
                {jumpDirection === "up" ? "↑" : "↓"}
              </span>
              <span>{t.jumpToCurrent}</span>
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
