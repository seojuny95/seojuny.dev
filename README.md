# codydev.blog

Minimal personal blog built with Next.js App Router + MDX.

## Develop

```bash
pnpm install
pnpm dev
```

Visit http://localhost:3000.

## Write a post

Create `content/posts/YYYY-MM-DD-slug.mdx` with frontmatter:

```mdx
---
title: "제목"
date: "2026-04-22"
summary: "요약 (선택)"
tags: ["태그"]
draft: false
---

본문을 여기에 Markdown으로 작성합니다.
```

- Filename prefix `YYYY-MM-DD-` is stripped — slug becomes everything after.
- `draft: true` excludes the post from the build.
- Images go in `public/` and are referenced as `/filename.jpg`.

## Test

```bash
pnpm test
```

## Build

```bash
pnpm build
pnpm start   # production preview
```

## Deploy

Push to `main` on a GitHub repo linked to a Vercel project. Vercel auto-deploys.

After the first deploy, set `NEXT_PUBLIC_SITE_URL` to the deployed URL (e.g., `https://codydev.vercel.app`) so the RSS feed links are absolute. Redeploy once.

## Structure

```
app/           # App Router pages and route handlers
components/    # Reusable UI components
content/       # Posts and About content (source of truth)
lib/           # Server-side helpers (posts.ts)
public/        # Static assets
```
