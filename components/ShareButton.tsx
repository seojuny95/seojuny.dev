'use client';

import { useEffect, useRef, useState } from 'react';

// Web Share API가 있으면 네이티브 공유 시트, 없으면 링크 복사로 폴백(복사됨 피드백).
export function ShareButton() {
  const resetTimer = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // 사용자 취소/실패는 무시
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? '링크 복사됨' : '공유'}
      data-copied={copied || undefined}
      className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M2.5 7.3L5.4 10.2L11.5 3.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
        </svg>
      )}
      <span>{copied ? '복사됨' : '공유'}</span>
    </button>
  );
}
