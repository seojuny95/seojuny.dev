# seojuny.dev

Personal blog built on Next.js + MDX.

## Development

```bash
pnpm install
pnpm dev    # http://localhost:3000
pnpm test   # Vitest
pnpm lint
```

## Authoring posts

Add a new file at `content/posts/YYYY-MM-DD-slug.mdx`:

```mdx
---
title: "Post title"
date: "2026-04-30"
summary: "Short summary"
tags: ["tag"]
draft: false
---
```

Static assets (images, etc.) go in `public/` (create the directory if it doesn't exist) and are referenced as `/filename.ext`. Posts with `draft: true` are excluded from the build.

## Deployment

Pushing to `main` triggers an automatic Vercel deployment. After the first deploy, set `NEXT_PUBLIC_SITE_URL` (an absolute URL used for RSS and canonical links) in the Vercel project's environment variables.
