'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { matchable, isHighlightOutOfView } from '@/lib/speech';
import { ui, type Locale } from '@/lib/i18n';

const RATES = [1, 1.25, 1.5, 2] as const;

// 상단 sticky 헤더(57px)와 그 아래 뜨는 미니플레이어 높이만큼 띄워, 자동 스크롤이 현재 문장을 두 바 아래로 두게 한다
const TOP_INSET = 104;
const BOTTOM_INSET = 40;

type Status = 'idle' | 'playing' | 'paused';
type Timing = { text: string; start: number; end: number };
type Segment = { start: number; end: number; range: Range | null; block: Element | null };

const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, td, th';

// CSS Custom Highlight API (미지원 브라우저는 하이라이트만 생략)
interface HighlightLike {
  add(range: Range): void;
  clear(): void;
}
interface HighlightCtor {
  new (): HighlightLike;
}
interface HighlightRegistry {
  set(name: string, highlight: HighlightLike): void;
  delete(name: string): void;
}
function getHighlightApi(): { registry: HighlightRegistry; Ctor: HighlightCtor } | null {
  if (typeof CSS === 'undefined') return null;
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
  const Ctor = (globalThis as unknown as { Highlight?: HighlightCtor }).Highlight;
  return registry && Ctor ? { registry, Ctor } : null;
}

// 본문(.prose-blog)에서 각 문장 텍스트를 찾아 DOM Range로 매핑한다.
// 코드블록(pre)·표(.table-wrap)·캡션(figcaption)은 낭독 대상이 아니므로 제외하고,
// 글자/숫자만 남긴 정규화 문자열에서 문장을 순서대로 탐색해 공백·문장부호 차이를 흡수한다.
function buildSegments(timings: Timing[]): Segment[] {
  const root = document.querySelector('.prose-blog');
  if (!root) {
    return timings.map((t) => ({ start: t.start, end: t.end, range: null, block: null }));
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('pre, .table-wrap, figcaption, .katex')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let norm = '';
  const map: { node: Text; offset: number }[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? '';
    for (let i = 0; i < text.length; i++) {
      const m = matchable(text[i]);
      if (m) {
        norm += m;
        map.push({ node: node as Text, offset: i });
      }
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;
  for (const t of timings) {
    const needle = matchable(t.text);
    let range: Range | null = null;
    let block: Element | null = null;
    if (needle) {
      const idx = norm.indexOf(needle, cursor);
      if (idx !== -1) {
        const a = map[idx];
        const b = map[idx + needle.length - 1];
        range = document.createRange();
        range.setStart(a.node, a.offset);
        range.setEnd(b.node, b.offset + 1);
        block = a.node.parentElement?.closest(BLOCK_SELECTOR) ?? null;
        cursor = idx + needle.length;
      }
    }
    segments.push({ start: t.start, end: t.end, range, block });
  }
  return segments;
}

export function SpeechPlayer({
  audioSrc,
  timingSrc,
  locale,
}: {
  audioSrc?: string;
  timingSrc?: string;
  locale: Locale;
}) {
  const t = ui[locale];
  const [status, setStatus] = useState<Status>('idle');
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inlineVisible, setInlineVisible] = useState(true);
  const inlineRef = useRef<HTMLDivElement | null>(null);
  const followRef = useRef(true);
  const [followSuspended, setFollowSuspended] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const segmentsRef = useRef<Segment[] | null>(null);
  const activeRef = useRef(-1);
  const highlightRef = useRef<HighlightLike | null>(null);
  const suppressYieldUntil = useRef(0);
  const playPauseRef = useRef<HTMLButtonElement | null>(null);
  const [jumpDir, setJumpDir] = useState<'up' | 'down' | null>(null);

  const recomputeJump = useCallback(() => {
    const segments = segmentsRef.current;
    const active = activeRef.current;
    const range = active >= 0 && segments ? segments[active].range : null;
    if (!range) {
      setJumpDir(null);
      return;
    }
    const rect = range.getBoundingClientRect();
    if (rect.bottom <= TOP_INSET) setJumpDir('up');
    else if (rect.top >= window.innerHeight - BOTTOM_INSET) setJumpDir('down');
    else setJumpDir(null);
  }, []);

  // 단일 Highlight 객체를 유지하며 clear() 후 현재 range만 add() — 항상 한 구간만 칠해진다.
  // (매번 새 Highlight를 set하면 일부 브라우저에서 이전 range가 안 지워져 잔류가 생긴다.)
  const setHighlight = useCallback((range: Range | null) => {
    const api = getHighlightApi();
    if (!api) return;
    if (!highlightRef.current) {
      highlightRef.current = new api.Ctor();
      api.registry.set('reading', highlightRef.current);
    }
    highlightRef.current.clear();
    if (range) highlightRef.current.add(range);
  }, []);

  const prepare = useCallback(async () => {
    if (segmentsRef.current || !timingSrc) return;
    try {
      const res = await fetch(timingSrc);
      const timings = (await res.json()) as Timing[];
      segmentsRef.current = buildSegments(timings);
    } catch {
      segmentsRef.current = [];
    }
  }, [timingSrc]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    setTime(t);
    const segments = segmentsRef.current;
    if (!segments) return;
    let idx = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start <= t) idx = i;
      else break;
    }
    // 문장이 끝나면 같은 문단의 다음 문장으로 미리 옮긴다 — 문장 사이 공백(평균 ~0.3초)
    // 동안 이미 읽은 문장이 남지 않게 하면서 깜빡임도 막는다. 문단이 바뀌면 즉시 끈다.
    let active = -1;
    if (idx >= 0) {
      const seg = segments[idx];
      const next = segments[idx + 1];
      if (t < seg.end) active = idx;
      else if (next && seg.block && next.block === seg.block) active = idx + 1;
    }
    if (active === activeRef.current) return;
    activeRef.current = active;
    const range = active >= 0 ? segments[active].range : null;
    setHighlight(range);
    if (range && followRef.current) {
      const rect = range.getBoundingClientRect();
      if (isHighlightOutOfView(rect, window.innerHeight, { top: TOP_INSET, bottom: BOTTOM_INSET })) {
        range.startContainer.parentElement?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }
    if (!followRef.current) recomputeJump();
  }, [setHighlight, recomputeJump]);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (status === 'playing') {
      audio.pause();
      return;
    }
    if (status === 'idle') {
      audio.currentTime = 0;
      followRef.current = true;
      setFollowSuspended(false);
    }
    await prepare();
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    void audio.play();
  }, [status, rate, prepare]);

  const skip = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = audio.duration || audio.currentTime + delta;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), max);
  }, []);

  const scrollToCurrent = useCallback(() => {
    const segments = segmentsRef.current;
    const active = activeRef.current;
    const range = active >= 0 && segments ? segments[active].range : null;
    range?.startContainer.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const resumeFollow = useCallback(() => {
    followRef.current = true;
    suppressYieldUntil.current = Date.now() + 600;
    setFollowSuspended(false);
    setJumpDir(null);
    scrollToCurrent();
    playPauseRef.current?.focus({ preventScroll: true });
  }, [scrollToCurrent]);

  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
      audioRef.current.preservesPitch = true;
    }
  }, [rate]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      getHighlightApi()?.registry.delete('reading');
    },
    [],
  );

  useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setInlineVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (status === 'idle') return;
    const yield_ = () => {
      if (Date.now() < suppressYieldUntil.current) return;
      if (!followRef.current) return;
      followRef.current = false;
      setFollowSuspended(true);
      recomputeJump();
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        const el = document.activeElement as HTMLElement | null;
        const tag = el?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
        yield_();
      }
    };
    window.addEventListener('wheel', yield_, { passive: true });
    window.addEventListener('touchmove', yield_, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', yield_);
      window.removeEventListener('touchmove', yield_);
      window.removeEventListener('keydown', onKey);
    };
  }, [status, recomputeJump]);

  // 칩 방향은 스크롤마다 갱신(초기값은 yield_, 해제는 onPause·onEnded·resumeFollow).
  useEffect(() => {
    if (!followSuspended || status !== 'playing') return;
    window.addEventListener('scroll', recomputeJump, { passive: true });
    return () => window.removeEventListener('scroll', recomputeJump);
  }, [followSuspended, status, recomputeJump]);

  // 듣기 세션 중(재생/일시정지)에는 스페이스바로 재생/일시정지 토글.
  // 입력창·버튼 포커스 시에는 가로채지 않아 평소 스크롤·버튼 동작을 보존한다.
  useEffect(() => {
    if (status === 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || el?.isContentEditable) {
        return;
      }
      e.preventDefault();
      void handlePlayPause();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [status, handlePlayPause]);

  if (!audioSrc) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        title={t.audioNotReady}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] opacity-50 cursor-not-allowed"
      >
        <PlayIcon />
        <span>{t.listen}</span>
      </button>
    );
  }

  const showMini = !inlineVisible && status !== 'idle';

  return (
    <>
      <div ref={inlineRef} className="flex items-center gap-4">
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onPlay={() => setStatus('playing')}
          onPause={() => {
            setStatus((s) => (s === 'idle' ? 'idle' : 'paused'));
            activeRef.current = -1;
            setHighlight(null);
            setJumpDir(null);
          }}
          onEnded={() => {
            setStatus('idle');
            activeRef.current = -1;
            setHighlight(null);
            setJumpDir(null);
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration || 0)}
          className="hidden"
        />
        <Controls
          status={status}
          time={time}
          duration={duration}
          rate={rate}
          locale={locale}
          onPlayPause={handlePlayPause}
          onSkip={skip}
          onCycleRate={cycleRate}
          playPauseRef={playPauseRef}
        />
      </div>
      {showMini && typeof document !== 'undefined'
        ? createPortal(
            <div className="speech-mini" role="region" aria-label={t.playerAria}>
              <div className="speech-mini-inner">
                <Controls
                  status={status}
                  time={time}
                  duration={duration}
                  rate={rate}
                  locale={locale}
                  onPlayPause={handlePlayPause}
                  onSkip={skip}
                  onCycleRate={cycleRate}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
      {jumpDir && typeof document !== 'undefined'
        ? createPortal(
            <button
              type="button"
              onClick={resumeFollow}
              aria-label={t.jumpToCurrentAria}
              className={`speech-jump speech-jump-${jumpDir}`}
            >
              <span aria-hidden className="speech-jump-arrow">
                {jumpDir === 'up' ? '↑' : '↓'}
              </span>
              <span>{t.jumpToCurrent}</span>
            </button>,
            document.body,
          )
        : null}
    </>
  );
}

function Controls({
  status,
  time,
  duration,
  rate,
  locale,
  onPlayPause,
  onSkip,
  onCycleRate,
  playPauseRef,
}: {
  status: Status;
  time: number;
  duration: number;
  rate: (typeof RATES)[number];
  locale: Locale;
  onPlayPause: () => void;
  onSkip: (delta: number) => void;
  onCycleRate: () => void;
  playPauseRef?: React.Ref<HTMLButtonElement>;
}) {
  const t = ui[locale];
  const isPlaying = status === 'playing';
  return (
    <>
      <button
        ref={playPauseRef}
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? t.pause : status === 'paused' ? t.resume : t.listenPostAria}
        className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
        <span>{isPlaying ? t.pause : status === 'paused' ? t.resume : t.listen}</span>
      </button>
      {status !== 'idle' ? (
        <>
          <span className="text-[12px] tabular-nums text-[var(--muted)]">
            {fmtTime(time)} / {fmtTime(duration)}
          </span>
          <button
            type="button"
            onClick={() => onSkip(-15)}
            aria-label={t.back15}
            className="inline-flex items-center gap-0.5 text-[12px] tabular-nums text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
          >
            <RewindIcon />
            <span>15</span>
          </button>
          <button
            type="button"
            onClick={() => onSkip(15)}
            aria-label={t.forward15}
            className="inline-flex items-center gap-0.5 text-[12px] tabular-nums text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
          >
            <span>15</span>
            <ForwardIcon />
          </button>
          <button
            type="button"
            onClick={onCycleRate}
            aria-label={t.rateAria(rate)}
            className="text-[13px] tabular-nums text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
          >
            {rate}x
          </button>
        </>
      ) : null}
    </>
  );
}

function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3.5 2.5l8 4.5-8 4.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <rect x="3.5" y="2.8" width="2.6" height="8.4" rx="0.6" />
      <rect x="7.9" y="2.8" width="2.6" height="8.4" rx="0.6" />
    </svg>
  );
}

function RewindIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 2v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 8" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 2v6h-6" />
      <path d="M20.49 15a9 9 0 1 1-2.13-9.36L21 8" />
    </svg>
  );
}
