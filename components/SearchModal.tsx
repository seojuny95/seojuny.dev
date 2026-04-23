'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import type { SearchEntry } from '@/lib/posts';

export function SearchModal({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: ['title', 'summary', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [index],
  );

  const trimmed = query.trim();
  const results = trimmed ? fuse.search(trimmed).map((r) => r.item) : [];

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIdx(0);
  }, []);

  useEffect(() => {
    const down = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery('');
            setActiveIdx(0);
          }
          return !prev;
        });
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('open-search', openSearch);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('open-search', openSearch);
    };
  }, [openSearch]);

  useEffect(() => {
    if (!open) {
      if (previousFocus.current) {
        previousFocus.current.focus();
        previousFocus.current = null;
      }
      document.body.style.overflow = '';
      return;
    }
    previousFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  const onQueryChange = (value: string) => {
    setQuery(value);
    setActiveIdx(0);
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const pick = results[activeIdx];
      if (pick) {
        e.preventDefault();
        router.push(`/posts/${pick.slug}`);
        closeSearch();
      }
    }
  };

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[15vh]"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={closeSearch}
        className="search-backdrop absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div className="search-panel relative w-full max-w-[540px] bg-[var(--bg)] border border-[var(--rule)] rounded-md overflow-hidden flex flex-col">
        <div className="relative px-4 py-3 border-b border-[var(--rule)]">
          <input
            ref={inputRef}
            type="text"
            placeholder="검색어를 입력하세요"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKey}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent border-0 outline-none text-[16px] pr-7 placeholder:text-[var(--muted)]"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[18px] h-[18px] rounded-sm text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--fg)_6%,transparent)] transition-colors duration-200"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {trimmed ? (
          <p className="px-4 pt-2.5 text-[12px] text-[var(--muted)] tabular-nums">
            <span>{results.length}</span>
            <span className="mx-1.5">·</span>
            <span>&ldquo;{trimmed}&rdquo;</span>
          </p>
        ) : null}

        <ul
          role="listbox"
          className="max-h-[50vh] overflow-y-auto list-none p-1.5 m-0"
        >
          {!trimmed ? (
            <li className="py-10 text-center text-[14px] text-[var(--muted)]">
              검색어를 입력하세요
            </li>
          ) : results.length === 0 ? (
            <li className="py-10 text-center text-[14px] text-[var(--muted)]">
              결과 없음
            </li>
          ) : (
            results.map((r, i) => (
              <li key={r.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={activeIdx === i}
                  onClick={() => {
                    router.push(`/posts/${r.slug}`);
                    closeSearch();
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-sm transition-colors duration-150 ${
                    activeIdx === i
                      ? 'bg-[color-mix(in_srgb,var(--fg)_6%,transparent)]'
                      : ''
                  }`}
                >
                  <div className="text-[15px] font-medium leading-snug">{r.title}</div>
                  {r.summary ? (
                    <div className="text-[13px] text-[var(--muted)] mt-1 truncate">
                      {r.summary}
                    </div>
                  ) : null}
                  {r.tags && r.tags.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-[var(--muted)]">
                      {r.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded-sm bg-[color-mix(in_srgb,var(--fg)_5%,transparent)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="border-t border-[var(--rule)] px-4 py-2.5 flex items-center justify-between text-[12px] text-[var(--muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd>
              <span className="ml-1">이동</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd">↵</kbd>
              <span className="ml-1">열기</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="kbd">ESC</kbd>
            <span className="ml-1">닫기</span>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
