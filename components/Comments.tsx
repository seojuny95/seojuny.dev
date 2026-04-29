'use client';

import Giscus from '@giscus/react';
import { useSyncExternalStore } from 'react';

type GiscusTheme = 'light' | 'dark_dimmed';

function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getThemeClient(): GiscusTheme {
  return document.documentElement.classList.contains('dark') ? 'dark_dimmed' : 'light';
}

function getThemeServer(): GiscusTheme {
  return 'light';
}

export function Comments() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeClient, getThemeServer);

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
