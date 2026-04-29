# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager: `pnpm` (see `pnpm-workspace.yaml`).

- `pnpm dev` — Next.js dev server at http://localhost:3000
- `pnpm build` / `pnpm start` — production build + preview
- `pnpm lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `pnpm test` — Vitest, runs files in `lib/**/*.test.ts` (Node env)
- `pnpm test:watch` — Vitest watch mode
- Single test: `pnpm vitest run lib/posts.test.ts -t "excludes drafts"` (filters by file + test name)

Stack versions are non-trivially ahead of LLM training data: **Next.js 16.2**, **React 19.2**, **Tailwind v4** (CSS-first via `@import "tailwindcss"`), **Vitest 4**. Reread Next docs from `node_modules/next/dist/docs/` before writing code.

## Architecture

File-based MDX blog. All content lives in `content/`; `lib/posts.ts` is the single source of truth that the rest of the app reads from.

**Content pipeline (`lib/posts.ts`)**
- `content/posts/YYYY-MM-DD-slug.mdx` → `gray-matter` parses frontmatter (`title`, `date` required; `summary`, `tags`, `draft` optional)
- Slug derived by stripping the `YYYY-MM-DD-` filename prefix
- `getAllPosts()` filters drafts and sorts by date desc — every other helper composes on top of it (`getPostBySlug`, `getAllTags`, `getPostsByTag`, `getAdjacentPosts`, `getSearchIndex`)
- All functions read the filesystem on every call. They rely on `process.cwd()` — the test suite exploits this by `vi.spyOn(process, 'cwd')` to point at a temp dir (`lib/posts.test.ts`).

**Routing (`app/`, App Router)**
- Dynamic segments return `params` as a **Promise** — must `await params` (Next 16 convention, see `app/posts/[slug]/page.tsx`, `app/tags/[tag]/page.tsx`)
- Post and tag routes use `generateStaticParams()` for full SSG
- MDX is rendered in RSC via `next-mdx-remote/rsc` (`<MDXRemote source={post.content} />`) — no MDX build step; source is a string at render time
- `/about` reads `content/about.mdx` at module scope (statically inlined into the build)
- `/feed.xml` is a Route Handler with `export const dynamic = 'force-static'` (Atom feed via the `feed` package). Uses `NEXT_PUBLIC_SITE_URL` for absolute links; set this in Vercel after first deploy.
- `/search` renders a server-built `SearchEntry[]` (slug/title/summary/tags — no body content) and hands it to the client `SearchBox` which runs `fuse.js` in-browser.

**Theme / styling**
- `next-themes` (`attribute="class"`) toggles `:root.dark`; theme variables are CSS custom props in `app/globals.css` consumed through Tailwind v4's `@theme inline`
- Body font is Pretendard (variable, dynamic-subset) loaded via `@import "pretendard/..."` in `app/globals.css`. Post bodies use the `.prose-blog` class, not `@tailwindcss/typography`.

## Authoring conventions

- New post: `content/posts/YYYY-MM-DD-slug.mdx` with required `title` + `date` frontmatter. `draft: true` excludes from build.
- Images go in `public/` and are referenced as `/filename.ext`.
- Korean is the default content language (`<html lang="ko">`).
