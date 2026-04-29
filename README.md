# seojuny.blog

Next.js + MDX 기반 개인 블로그.

## 개발

```bash
pnpm install
pnpm dev    # http://localhost:3000
pnpm test   # Vitest
pnpm lint
```

## 글 작성

`content/posts/YYYY-MM-DD-slug.mdx` 형식으로 추가:

```mdx
---
title: "제목"
date: "2026-04-30"
summary: "요약"
tags: ["태그"]
draft: false
---
```

이미지는 `public/`에 두고 `/파일명.jpg`로 참조. `draft: true`면 빌드에서 제외됨.

## 배포

`main` 브랜치에 push하면 Vercel이 자동 배포. 첫 배포 후 프로젝트 환경변수에 `NEXT_PUBLIC_SITE_URL`(절대 URL — RSS/canonical에 사용)을 설정.
