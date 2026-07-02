'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { ui, type Locale } from '@/lib/i18n';

const UNLABELED_LANGS = new Set(['plaintext', 'text', 'txt']);

export function CodeBlock({
  locale,
  children,
  ...props
}: ComponentPropsWithoutRef<'pre'> & { locale: Locale }) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimer = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const t = ui[locale];

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const language = (props as Record<string, unknown>)['data-language'];
  const label =
    typeof language === 'string' && !UNLABELED_LANGS.has(language)
      ? language
      : null;

  const copy = async () => {
    const text = preRef.current?.textContent?.trimEnd();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="code-block">
      <div className="code-controls">
        {label ? (
          <span className="code-lang" aria-hidden>
            {label}
          </span>
        ) : null}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? t.copied : t.codeCopyAria}
          data-copied={copied || undefined}
          className="code-copy"
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2 6.5L4.8 9.3L10 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <rect
                x="4"
                y="4"
                width="6.5"
                height="6.5"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M8 1.5H3a1.5 1.5 0 0 0-1.5 1.5v5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
