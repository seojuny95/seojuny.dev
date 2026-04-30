'use client';

import Giscus from '@giscus/react';

export function Comments() {
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
      theme="light"
      lang="ko"
      loading="lazy"
    />
  );
}
