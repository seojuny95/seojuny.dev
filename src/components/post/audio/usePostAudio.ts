import { useCallback, useEffect, useRef, useState } from "react";

import { useReadingHighlight } from "./useReadingHighlight";
import { AUDIO_RATES, type AudioRate, type AudioStatus } from "./types";

export function usePostAudio(timingSrc?: string) {
  const [duration, setDurationState] = useState(0);
  const [inlineVisible, setInlineVisible] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  const [rate, setRate] = useState<AudioRate>(1);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [time, setTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inlineRef = useRef<HTMLDivElement | null>(null);
  const playPauseRef = useRef<HTMLButtonElement | null>(null);
  const {
    clear: clearReading,
    jumpDirection,
    prepare: prepareReading,
    resetFollow,
    resumeFollow,
    update: updateReading,
  } = useReadingHighlight({
    playPauseRef,
    status,
    timingSrc,
  });

  const playPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "playing") {
      audio.pause();
      return;
    }

    setPlaybackError(false);

    if (status === "idle") {
      audio.currentTime = 0;
      resetFollow();
    }

    audio.playbackRate = rate;
    audio.preservesPitch = true;
    void prepareReading();
    void audio.play().catch(() => {
      setPlaybackError(true);
      setStatus("idle");
      clearReading();
    });
  }, [clearReading, prepareReading, rate, resetFollow, status]);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const max = audio.duration || audio.currentTime + delta;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), max);
  }, []);

  const cycleRate = useCallback(() => {
    const next =
      AUDIO_RATES[(AUDIO_RATES.indexOf(rate) + 1) % AUDIO_RATES.length];
    setRate(next);

    if (audioRef.current) {
      audioRef.current.playbackRate = next;
      audioRef.current.preservesPitch = true;
    }
  }, [rate]);

  const onPause = useCallback(() => {
    setStatus((current) => (current === "idle" ? "idle" : "paused"));
    clearReading();
  }, [clearReading]);

  const onEnded = useCallback(() => {
    setStatus("idle");
    clearReading();
  }, [clearReading]);

  const onError = useCallback(() => {
    setPlaybackError(true);
    setStatus("idle");
    clearReading();
  }, [clearReading]);

  const onTimeUpdate = useCallback(() => {
    const currentTime = audioRef.current?.currentTime;
    if (currentTime === undefined) return;
    setTime(currentTime);
    updateReading(currentTime);
  }, [updateReading]);

  const setDuration = useCallback((value: number) => {
    setDurationState(value || 0);
  }, []);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  useEffect(() => {
    const element = inlineRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status === "idle") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;

      const element = document.activeElement as HTMLElement | null;
      if (
        element?.closest(
          'a, button, input, textarea, select, summary, [contenteditable="true"], [role="button"], [role="link"]',
        )
      ) {
        return;
      }

      event.preventDefault();
      void playPause();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [playPause, status]);

  return {
    audioRef,
    cycleRate,
    duration,
    inlineRef,
    jumpDirection,
    onEnded,
    onError,
    onPause,
    onPlay: () => setStatus("playing"),
    onTimeUpdate,
    playPause,
    playPauseRef,
    playbackError,
    rate,
    resumeFollow,
    setDuration,
    showMini: !inlineVisible && status !== "idle",
    skip,
    status,
    time,
  };
}
