'use client';

import Giscus from '@giscus/react';
import { useSyncExternalStore } from 'react';

type Mode = 'light' | 'dark';

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getMode(): Mode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getServerMode(): Mode {
  return 'light';
}

const noopSubscribe = () => () => {};

export function Comments() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const mode = useSyncExternalStore(subscribeTheme, getMode, getServerMode);

  // Theme URL needs to be absolute (giscus iframe fetches it cross-origin).
  // Wait until mounted so window.location.origin is available.
  const theme = mounted
    ? `${window.location.origin}/giscus-theme-${mode}.css`
    : 'light';

  return (
    <Giscus
      id="comments"
      repo="seojuny95/seojuny.blog"
      repoId="R_kgDOSQGXuQ"
      category="Announcements"
      categoryId="DIC_kwDOSQGXuc4C7-rz"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang="ko"
      loading="lazy"
    />
  );
}
