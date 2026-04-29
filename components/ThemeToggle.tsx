'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getThemeClient(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getThemeServer(): 'dark' | 'light' {
  return 'light';
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    getMountedClient,
    getMountedServer,
  );
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeClient,
    getThemeServer,
  );

  if (!mounted) {
    return <span aria-hidden className="inline-block w-[18px] h-[18px]" />;
  }

  const isDark = theme === 'dark';
  const next = isDark ? 'light' : 'dark';

  const toggle = () => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      aria-pressed={isDark}
      className="relative inline-flex w-[18px] h-[18px] items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
    >
      <span
        aria-hidden
        className="toggle-icon absolute inset-0 flex items-center justify-center text-[15px] leading-none"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.6)',
        }}
      >
        ☀
      </span>
      <span
        aria-hidden
        className="toggle-icon absolute inset-0 flex items-center justify-center text-[15px] leading-none"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'rotate(90deg) scale(0.6)' : 'rotate(0deg) scale(1)',
        }}
      >
        ☾
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {isDark ? '다크 모드로 전환됨' : '라이트 모드로 전환됨'}
      </span>
    </button>
  );
}
