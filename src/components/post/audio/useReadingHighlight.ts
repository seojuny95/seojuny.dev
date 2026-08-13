import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildSegments,
  getHighlightApi,
  isHighlightOutOfView,
  type HighlightLike,
  type Segment,
  type Timing,
} from "./highlight";
import type { AudioStatus } from "./types";

const TOP_INSET = 104;
const BOTTOM_INSET = 40;

interface Options {
  playPauseRef: React.RefObject<HTMLButtonElement | null>;
  status: AudioStatus;
  timingSrc?: string;
}

export function useReadingHighlight({
  playPauseRef,
  status,
  timingSrc,
}: Options) {
  const [followSuspended, setFollowSuspended] = useState(false);
  const [jumpDirection, setJumpDirection] = useState<"down" | "up" | null>(
    null,
  );

  const activeRef = useRef(-1);
  const followRef = useRef(true);
  const highlightRef = useRef<HighlightLike | null>(null);
  const segmentsRef = useRef<Segment[] | null>(null);
  const suppressYieldUntil = useRef(0);

  const setHighlight = useCallback((range: Range | null) => {
    const api = getHighlightApi();
    if (!api) return;

    if (!highlightRef.current) {
      highlightRef.current = new api.Ctor();
      api.registry.set("reading", highlightRef.current);
    }

    highlightRef.current.clear();
    if (range) highlightRef.current.add(range);
  }, []);

  const activeRange = useCallback(() => {
    const segments = segmentsRef.current;
    const active = activeRef.current;
    return active >= 0 && segments ? segments[active].range : null;
  }, []);

  const recomputeJump = useCallback(() => {
    const range = activeRange();
    if (!range) {
      setJumpDirection(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.bottom <= TOP_INSET) setJumpDirection("up");
    else if (rect.top >= window.innerHeight - BOTTOM_INSET)
      setJumpDirection("down");
    else setJumpDirection(null);
  }, [activeRange]);

  const prepare = useCallback(async () => {
    if (segmentsRef.current || !timingSrc) return;

    try {
      const response = await fetch(timingSrc);
      if (!response.ok)
        throw new Error(`Timing request failed: ${response.status}`);
      const timings = (await response.json()) as Timing[];
      segmentsRef.current = buildSegments(timings);
    } catch {
      segmentsRef.current = [];
    }
  }, [timingSrc]);

  const update = useCallback(
    (currentTime: number) => {
      const segments = segmentsRef.current;
      if (!segments) return;

      let index = -1;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].start <= currentTime) index = i;
        else break;
      }

      let active = -1;
      if (index >= 0) {
        const segment = segments[index];
        const next = segments[index + 1];
        if (currentTime < segment.end) active = index;
        else if (next && segment.block && next.block === segment.block)
          active = index + 1;
      }

      if (active === activeRef.current) return;
      activeRef.current = active;
      const range = active >= 0 ? segments[active].range : null;
      setHighlight(range);

      if (range && followRef.current) {
        const rect = range.getBoundingClientRect();
        if (
          isHighlightOutOfView(rect, window.innerHeight, {
            bottom: BOTTOM_INSET,
            top: TOP_INSET,
          })
        ) {
          range.startContainer.parentElement?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }

      if (!followRef.current) recomputeJump();
    },
    [recomputeJump, setHighlight],
  );

  const clear = useCallback(() => {
    activeRef.current = -1;
    setHighlight(null);
    setJumpDirection(null);
  }, [setHighlight]);

  const resetFollow = useCallback(() => {
    followRef.current = true;
    setFollowSuspended(false);
  }, []);

  const resumeFollow = useCallback(() => {
    followRef.current = true;
    suppressYieldUntil.current = Date.now() + 600;
    setFollowSuspended(false);
    setJumpDirection(null);
    activeRange()?.startContainer.parentElement?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    playPauseRef.current?.focus({ preventScroll: true });
  }, [activeRange, playPauseRef]);

  useEffect(
    () => () => {
      getHighlightApi()?.registry.delete("reading");
    },
    [],
  );

  useEffect(() => {
    segmentsRef.current = null;
    activeRef.current = -1;
    setHighlight(null);
  }, [setHighlight, timingSrc]);

  useEffect(() => {
    if (status === "idle") return;

    const suspendFollow = () => {
      if (Date.now() < suppressYieldUntil.current || !followRef.current) return;
      followRef.current = false;
      setFollowSuspended(true);
      recomputeJump();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
          event.key,
        )
      ) {
        return;
      }

      const element = document.activeElement as HTMLElement | null;
      if (
        element?.tagName === "INPUT" ||
        element?.tagName === "TEXTAREA" ||
        element?.isContentEditable
      ) {
        return;
      }
      suspendFollow();
    };

    window.addEventListener("wheel", suspendFollow, { passive: true });
    window.addEventListener("touchmove", suspendFollow, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", suspendFollow);
      window.removeEventListener("touchmove", suspendFollow);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [recomputeJump, status]);

  useEffect(() => {
    if (!followSuspended || status !== "playing") return;
    window.addEventListener("scroll", recomputeJump, { passive: true });
    return () => window.removeEventListener("scroll", recomputeJump);
  }, [followSuspended, recomputeJump, status]);

  return {
    clear,
    jumpDirection,
    prepare,
    resetFollow,
    resumeFollow,
    update,
  };
}
