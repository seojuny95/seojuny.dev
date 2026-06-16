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
- `pnpm generate:audio` — 글 본문 음성(TTS) + 문장 타이밍 생성. 기본은 **오디오 없는 글만**(증분). `--all`이면 전체 재생성(글로사리·보이스·추출 로직 변경 시), `<slug>` 지정 시 그 글만(본문 수정 시). 로컬 실행 — `ffmpeg`와 네트워크 필요.

Stack versions are non-trivially ahead of LLM training data: **Next.js 16.2**, **React 19.2**, **Tailwind v4** (CSS-first via `@import "tailwindcss"`), **Vitest 4**. Reread Next docs from `node_modules/next/dist/docs/` before writing code.

## Architecture

File-based MDX blog. All content lives in `content/`; `lib/posts.ts` is the single source of truth that the rest of the app reads from.

**Content pipeline (`lib/posts.ts`)**
- `content/posts/YYYY-MM-DD-slug.mdx` → `gray-matter` parses frontmatter (`title`, `date` required; `summary`, `tags`, `draft` optional)
- Slug derived by stripping the `YYYY-MM-DD-` filename prefix
- `getAllPosts()` filters drafts and sorts by date desc — every other helper composes on top of it (`getPostBySlug`, `getAdjacentPosts`, `getSearchIndex`)
- All functions read the filesystem on every call. They rely on `process.cwd()` — the test suite exploits this by `vi.spyOn(process, 'cwd')` to point at a temp dir (`lib/posts.test.ts`).

**Routing (`app/`, App Router)**
- URL shape is **flat at root**: `/` is the post list (year-grouped), individual posts live at `/<slug>` (no `/posts` namespace). Reserved root paths (`/about`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, brand icons in `app/`) take precedence over the `[slug]` segment, so post slugs must not collide with them.
- Dynamic segments return `params` as a **Promise** — must `await params` (Next 16 convention, see `app/[slug]/page.tsx`)
- Post routes use `generateStaticParams()` for full SSG
- MDX is rendered in RSC via `next-mdx-remote/rsc` (`<MDXRemote source={post.content} />`) — no MDX build step; source is a string at render time
- `/about` reads `content/about.mdx` inside the page component; the build statically inlines the result.
- `/feed.xml` is a Route Handler with `export const dynamic = 'force-static'` (Atom feed via the `feed` package). Uses `NEXT_PUBLIC_SITE_URL` for absolute links; set this in Vercel after first deploy.
- Search is a global ⌘K modal: `app/layout.tsx` builds `SearchEntry[]` (slug/title/summary/tags — no body content) and passes it to the `SearchModal` client component, which runs `fuse.js` in-browser. There is no `/search` route.

**Theme / styling**
- Light mode only. Theme variables are CSS custom props on `:root` in `app/globals.css`, consumed through Tailwind v4's `@theme inline`.
- Body font is Pretendard (variable, dynamic-subset) loaded via `@import "pretendard/..."` in `app/globals.css`. Post bodies use the `.prose-blog` class, not `@tailwindcss/typography`.

## Authoring conventions

- New post: `content/posts/YYYY-MM-DD-slug.mdx` with required `title` + `date` frontmatter. `draft: true` excludes from build.
- MDX 본문은 **`##` (h2)부터 시작**한다. 페이지의 `h1`은 `app/[slug]/page.tsx`가 frontmatter `title`로 렌더링하므로 본문에 `# ...`를 쓰면 h1이 두 개가 되어 헤딩 위계가 깨진다.
- Per-post images live in `public/posts/<slug>/<image>.ext` and are referenced as `/posts/<slug>/<image>.ext`. The slug must match the post filename's slug (i.e. the `YYYY-MM-DD-` prefix stripped) so each post's assets stay co-located in one folder and can be migrated/deleted as a unit. Use **kebab-case** for image filenames. Site-wide assets (not tied to a specific post) can live directly under `public/`.
- Brand icons live in `app/` via App Router file conventions: `icon.svg` (vector primary), `favicon.ico` (legacy fallback, multi-size), and `apple-icon.png` (180×180, iOS) — Next.js auto-injects the corresponding `<link>` tags, so no manual metadata is needed.
- Korean is the default content language (`<html lang="ko">`).
- 글 작성 후 **음성(듣기) 생성**: `pnpm generate:audio <slug>` 를 실행해 그 글만 만들고, 생성된 `public/posts/<slug>/audio.mp3`·`audio.json` 을 본문과 함께 커밋한다. 인자 없이 실행하면 오디오 없는 글만(증분) 생성된다 — 매번 전체를 다시 만들 필요 없음. 음성용 텍스트 정제(괄호·URL 제거)와 영어 용어 발음 교정은 `scripts/generate-audio.ts`의 `PRONUNCIATION` 글로사리에서 조정한다(글로사리를 바꾸면 `--all`로 전체 재생성). 페이지는 `audio.mp3` 존재를 감지해 "듣기" 컨트롤을 켠다.
