'use client';

import Giscus from '@giscus/react';
import { useTheme } from '@/lib/use-theme';

export function Comments() {
  const theme = useTheme();
  const giscusTheme = theme === 'dark' ? 'dark_dimmed' : 'light';

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
      theme={giscusTheme}
      lang="ko"
      loading="lazy"
    />
  );
}
