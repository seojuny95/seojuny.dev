# Personal Blog — Design Spec

**Date:** 2026-04-22
**Owner:** codydev

## Goal

A simple, minimal personal blog with clean black-and-white typography. Desktop and mobile layouts. Korean content. Deployed to Vercel as a static site.

## Decisions

| Area | Choice |
|---|---|
| Framework | Next.js (App Router, latest) on Node.js 24 |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Content | Local `.mdx` files in `content/posts/`, frontmatter via `gray-matter` |
| Rendering | `next-mdx-remote/rsc` — React Server Components, zero client JS for post content |
| Theme | `next-themes` for light/dark toggle (class-based, system default) |
| Search | Client-side Fuse.js against a build-time JSON index |
| RSS | Route Handler at `/feed.xml` using the `feed` package |
| Language | Korean only |
| Deployment | Vercel, `<project>.vercel.app` subdomain |
| Testing | Vitest for `lib/posts.ts` + `next build` as smoke test |

## Project structure

```
my-blog/
├── app/
│   ├── layout.tsx              # Root layout — header, footer, fonts, theme
│   ├── page.tsx                # Home (recent posts list)
│   ├── posts/page.tsx          # Full post archive (grouped by year)
│   ├── posts/[slug]/page.tsx   # Individual post page
│   ├── tags/page.tsx           # All tags listing
│   ├── tags/[tag]/page.tsx     # Posts filtered by tag
│   ├── about/page.tsx          # About page
│   ├── search/page.tsx         # Search page (client component)
│   ├── feed.xml/route.ts       # RSS/Atom feed
│   └── not-found.tsx           # 404 page
├── content/
│   ├── about.mdx
│   └── posts/
│       └── 2026-04-22-hello-world.mdx
├── lib/
│   └── posts.ts                # getAllPosts, getPostBySlug, getAllTags, getSearchIndex
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PostList.tsx
│   ├── ThemeToggle.tsx
│   └── SearchBox.tsx
├── public/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── README.md
```

## Content model

Post frontmatter (YAML):

```mdx
---
title: "첫 번째 글"
date: "2026-04-22"
summary: "블로그를 시작하며"
tags: ["일기", "개발"]
draft: false
---

본문은 Markdown.
```

- `title` (required, string)
- `date` (required, ISO `YYYY-MM-DD`)
- `summary` (optional, string) — shown in listings and RSS
- `tags` (optional, string[])
- `draft` (optional, boolean, default `false`) — drafts are excluded from build

**Slug:** derived from filename with any leading `YYYY-MM-DD-` stripped. `2026-04-22-hello-world.mdx` → `/posts/hello-world`.

**Library API (`lib/posts.ts`):**

```ts
type Post = {
  slug: string;
  title: string;
  date: string;       // ISO
  summary?: string;
  tags: string[];
  content: string;    // raw MDX body
};

type TagInfo = { tag: string; count: number };

type SearchEntry = Pick<Post, 'slug' | 'title' | 'summary' | 'tags'>;

export function getAllPosts(): Post[];                 // drafts excluded, date desc
export function getPostBySlug(slug: string): Post;
export function getAllTags(): TagInfo[];               // sorted by count desc
export function getPostsByTag(tag: string): Post[];
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post };
export function getSearchIndex(): SearchEntry[];
```

## Pages & routes

| Route | Purpose |
|---|---|
| `/` | Recent 20 posts + one-line site intro |
| `/posts` | Full archive, grouped by year |
| `/posts/[slug]` | Post page: title, date, tags, MDX body, prev/next links |
| `/tags` | All tags with post counts |
| `/tags/[tag]` | Posts filtered by tag |
| `/about` | About page rendered from `content/about.mdx` |
| `/search` | Client search over build-time JSON index |
| `/feed.xml` | RSS/Atom feed |
| `/404` | Not-found page with link home |

**Header nav:** Home · Posts · Tags · About · Search · 🌓 theme toggle
**Post page:** back link, title, date, tags, MDX content, horizontal rule, prev/next links.

## Styling & theme

- **Fonts:** Body = `Noto Serif KR` (Korean serif, self-hosted via `next/font`), fallback `Georgia, serif`. UI = system sans (`-apple-system, BlinkMacSystemFont, ...`).
- **Palette:**
  - Light: bg `#ffffff`, text `#111111`, muted `#666666`, rule `#e5e5e5`.
  - Dark: bg `#0a0a0a`, text `#f2f2f2`, muted `#999999`, rule `#262626`.
- **Typography:** body ~18px, line-height 1.75, `max-width: 640px`, centered column.
- **Prose:** minimal — thin horizontal rules, subtle blockquote border-left, underlined links.
- **No color accents.** No sidebars.
- **Theme:** `next-themes` with `class` strategy. System default, toggleable in header, persisted to `localStorage`.

## Responsive

- Desktop (≥640px): 640px centered column, generous vertical rhythm.
- Mobile (<640px): horizontal padding 1rem (16px), type scale stays readable.
- No separate mobile navigation — header collapses gracefully because nav is text-only and short.

## Search

- `lib/posts.ts` exposes `getSearchIndex()` returning `{ slug, title, summary, tags }[]`.
- At build time, the `/search` page is a thin Server Component that passes the index to a client `SearchBox` component.
- `SearchBox` uses Fuse.js (fuzzy match on `title`, `summary`, `tags`) and updates results as the user types.
- Works for Hangul because Fuse matches on characters, not word boundaries.

## RSS feed

- Route Handler at `app/feed.xml/route.ts`.
- Uses the `feed` package to produce Atom XML.
- Reads `getAllPosts()`, includes `title`, `summary` (or truncated body), `date`, `link`.
- Linked from `<head>` via `<link rel="alternate" type="application/atom+xml" href="/feed.xml" />`.

## Testing

- **Unit tests (Vitest)** for `lib/posts.ts`:
  - Frontmatter parsing (required/optional fields, type coercion).
  - Draft filtering.
  - Slug derivation (with and without date prefix).
  - Tag aggregation + sorting.
  - `getAdjacentPosts` handles first/last posts.
- **Integration:** `next build` passing counts as smoke test (catches broken routes, broken MDX, missing frontmatter).
- No E2E for v1 — YAGNI.

## Deployment

- Vercel project, linked to a Git repo (user to create).
- `main` branch → production deploy.
- Static output: all routes prerendered at build time. No server-side runtime cost.
- Default Vercel subdomain `<project>.vercel.app`.

## Out of scope for v1

- Comments (no Disqus, no Giscus)
- Newsletter/email subscriptions
- Analytics
- Image optimization beyond Next.js defaults
- Multilingual routing (Korean only for now)
- CMS integration
- Post drafts UI (just flip `draft: true/false` in frontmatter)
