# codydev.blog

Next.js + MDX 기반 개인 블로그.

## 개발

```bash
pnpm install
pnpm dev
```

## 글 작성

`content/posts/YYYY-MM-DD-slug.mdx`

```mdx
---
title: "제목"
date: "2026-04-22"
summary: "요약"
tags: ["태그"]
draft: false
---
```

이미지는 `public/`에 두고 `/파일명.jpg`로 참조.

## 배포

`main`에 푸시하면 Vercel이 자동 배포. 첫 배포 후 `NEXT_PUBLIC_SITE_URL`을 배포 URL로 설정.
