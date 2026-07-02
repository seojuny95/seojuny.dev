# Blog Bilingual (Korean/English) i18n — Design

Date: 2026-07-02
Status: Approved design (pending user spec review)

## Goal

Add English support to the blog (seojuny.dev) alongside the existing Korean site, and
provide English versions of all existing content — post bodies, diagrams, audio, About,
UI chrome, and SEO/feed. Korean stays at the URL root; English lives under `/en`.

## Decisions (locked)

- **URL shape**: Korean at root (`/`, `/:slug`, `/about`), English under `/en` prefix
  (`/en`, `/en/:slug`, `/en/about`).
- **Translation of existing 8 posts**: AI-translated now. **No literal translation** —
  natural, idiomatic English that preserves the author's voice and follows the blog
  writing-style (minimal italics; AI/ML posts use Python examples and plain-language prose
  for math).
- **Scope**: everything — UI chrome, About page, metadata/SEO, feed.xml, llms.txt.
- **Images/audio must be localized too**: all 123 SVG diagrams get English versions;
  audio (TTS) gets an English version.
- **Missing-translation behavior (no fallback)**: a post that exists in only one language
  appears only in that language's list; direct access to the missing counterpart is a 404.
  Locales are fully independent.
- **Artifacts language**: all git commits, PR titles/bodies, and code comments in English
  going forward. Past 42 Korean commit messages rewritten to English as the final step.
- **Auto language redirect**: on the home page (`/`) only. First-time visitors whose
  browser prefers English get redirected to `/en`; an explicit choice via the KO/EN
  switcher is remembered in a cookie and always wins. Post/About URLs never auto-redirect
  (shared links stay in their intended language).

## Non-goals
- Auto-redirect on any path other than `/` (post/About links are never language-switched
  automatically).
- Translating the 3 PNG paper screenshots' contents (already English/neutral; copied as-is).
- A third locale. Structure allows adding one later but we build for `ko` + `en` only.

## Architecture

### Locale model — `lib/i18n.ts` (new)

```ts
export type Locale = 'ko' | 'en';
export const locales: Locale[] = ['ko', 'en'];
export const defaultLocale: Locale = 'ko';
```

Plus a UI-string dictionary `ui: Record<Locale, {...}>` covering every hard-coded string
currently in components/pages:

- reading time unit (`분` → `min read`)
- home heading (`Posts`), empty state (`글이 아직 없습니다.` → `No posts yet.`)
- post nav: `← Posts`, `이전 글`/`Previous`, `다음 글`/`Next`
- skip link (`본문으로 건너뛰기` → `Skip to content`)
- search modal placeholders / labels
- header nav labels, footer text
- date locale (`ko-KR` / `en-US`) and format style

### Content structure (existing Korean files unchanged — no moves)

```
content/posts/YYYY-MM-DD-slug.mdx    Korean (existing)
content/about.mdx                    Korean (existing)
content/en/posts/YYYY-MM-DD-slug.mdx English (new; same filename ⇒ same slug)
content/en/about.mdx                 English (new)
```

Slug is still derived by stripping the `YYYY-MM-DD-` prefix, so `/en/<slug>` and `/<slug>`
resolve to the same slug in different locales.

### Asset structure

```
public/posts/<slug>/*.svg|png|mp3|json     Korean (existing)
public/posts/<slug>/en/*                   English (new)
```

- English SVGs: `public/posts/<slug>/en/<name>.svg` — Korean `<text>` translated + layout
  (width/x-anchor/wrapping) adjusted so longer English labels don't overflow.
- PNGs: copied unchanged into `en/` for path uniformity.
- English audio: `public/posts/<slug>/en/audio.mp3` + `audio.json`.
- English MDX references assets uniformly as `/posts/<slug>/en/...`.

### `lib/posts.ts` — locale parameterized

Add `locale: Locale = 'ko'` to `getAllPosts`, `getPostBySlug`, `getAdjacentPosts`,
`getSearchIndex`. `postsDir(locale)` maps `ko → content/posts`, `en → content/en/posts`.
`formatDate(isoDate, locale)` switches `Intl.DateTimeFormat` locale (`ko-KR` long form vs
`en-US` `July 2, 2026`). Missing post ⇒ `notFound()` (no cross-locale fallback).
`readingTime` already handles both scripts — unchanged.

### Home-only language redirect — `proxy.ts` (new)

Next 16 `proxy.ts` at the repo root, matcher limited to `'/'` so every other route stays
purely static with zero proxy overhead:

1. If a `locale` cookie exists (`ko` | `en`): redirect `/` → `/en` when it says `en`;
   stay when it says `ko`.
2. No cookie: parse `Accept-Language`; if English is preferred over Korean, 307-redirect
   to `/en`. Otherwise fall through to the Korean home.
3. Crawlers are unaffected in practice (no `Accept-Language` preference for `en` ⇒ no
   redirect; hreflang tags cover indexing both locales).

The KO/EN switcher sets the `locale` cookie (1 year, `path=/`) on click, so an explicit
choice always overrides browser preference on later visits.

### Routing — two root layouts via route groups (fully static; proxy only on `/`)

Remove `app/layout.tsx`. Each route group owns its own `<html lang>`/`<body>` (Next 16
"multiple root layouts", confirmed in
`node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`).

```
app/
  (ko)/
    layout.tsx            <html lang="ko"> + Korean chrome + ko search index
    page.tsx              /            → <PostList locale="ko" />
    [slug]/page.tsx       /:slug       → <PostView locale="ko" />
    [slug]/opengraph-image.tsx
    about/page.tsx        /about
    template.tsx          page transition (ko)
    not-found.tsx
  (en)/
    layout.tsx            <html lang="en"> + English chrome + en search index
    en/page.tsx           /en          → <PostList locale="en" />
    en/[slug]/page.tsx    /en/:slug    → <PostView locale="en" />
    en/[slug]/opengraph-image.tsx
    en/about/page.tsx     /en/about
    en/feed.xml/route.ts  /en/feed.xml
    en/llms.txt/route.ts  /en/llms.txt
    template.tsx          page transition (en)
    not-found.tsx
  # app-root singletons (shared, unchanged location):
  sitemap.ts robots.ts manifest.ts
  feed.xml/route.ts llms.txt/route.ts        (Korean)
  icon.svg favicon.ico apple-icon.png opengraph-image.tsx
  globals.css fonts.ts
```

### DRY rule — route files are shells, logic lives once

The two route groups necessarily mirror each other's file *shape*, but no logic is written
twice. Hard rule: **every file under `(ko)`/`(en)` is a thin delegator (a few lines: bind
`locale`, re-export), and anything longer lives in exactly one shared module.** If a change
would require editing both groups' versions of a file beyond the `locale` binding, the
shared layer is wrong — fix that instead.

Single-source modules and what delegates to them:

| Shared module (one copy)                       | Used by                                      |
| ---------------------------------------------- | -------------------------------------------- |
| `components/layout/SiteShell.tsx` (html/body, chrome, JSON-LD, search wiring) | both `layout.tsx` |
| `components/pages/PostList.tsx`                | both home `page.tsx`                         |
| `components/pages/PostView.tsx` (incl. the MDX components map) | both `[slug]/page.tsx`      |
| `components/pages/AboutPage.tsx`               | both `about/page.tsx`                        |
| `lib/metadata.ts` (`buildSiteMetadata(locale)`, `buildPostMetadata(post, locale)`, hreflang/JSON-LD builders) | both layouts + post pages |
| `lib/feed.ts` (`buildFeed(locale)`)            | `/feed.xml` + `/en/feed.xml` routes          |
| `lib/llms.ts` (`buildLlmsTxt(locale)`)         | `/llms.txt` + `/en/llms.txt` routes          |
| `lib/og-image.tsx` (render function)           | both `opengraph-image.tsx`                   |
| `app/template-transition.tsx` (or equivalent)  | both `template.tsx`                          |
| `components/NotFound.tsx`                      | both `not-found.tsx`                         |
| `lib/i18n.ts` dictionary                       | all of the above (no string literals in route files or duplicated per-locale components) |

Existing components (`Header`, `Footer`, `SearchModal`, …) are **modified in place** to
take `locale` — never forked into `HeaderEn`-style copies. Same for content tooling:
`scripts/generate-audio.ts` gains a locale dimension rather than a second script, and
`lib/posts.ts` stays the single content reader for both locales.

Exact placement of `template.tsx` / `not-found.tsx` / global metadata files under the
multiple-root-layout regime is verified against Next 16 docs during implementation; module
paths above may shift slightly, but the one-copy rule holds regardless.

### UI chrome + language switcher

`Header`, `Footer`, `NavLinks`, `MobileMenu`, `SearchModal`, `SearchTrigger` take a
`locale` prop and read strings from `ui[locale]`; internal links are locale-prefixed
(`ko → /...`, `en → /en/...`). A **KO / EN switcher** in the header links to the same slug
in the other locale when a counterpart exists, otherwise to that locale's home. The
switcher is a client component using `usePathname()` to remap the prefix; a server-provided
hint indicates whether the counterpart exists for graceful home-fallback.

### SEO / metadata / feed

- Per-page `generateMetadata`: locale title/description, `alternates.languages` (hreflang
  `ko`↔`en`, plus `x-default` → Korean root), `alternates.canonical`, `openGraph.locale`
  (`ko_KR` / `en_US`).
- `sitemap.ts`: emit both locales' URLs with `alternates.languages`.
- JSON-LD `inLanguage` per locale; site/person JSON-LD localized in each root layout.
- `/en/feed.xml` (Atom) and `/en/llms.txt` mirror the Korean handlers over English content.

## Execution phases (sequential, each verified before the next)

**Phase 1 — Infrastructure.** `lib/i18n.ts`, locale-parameterized `lib/posts.ts` (+ tests),
route-group restructure with two root layouts, shared locale-taking page components,
localized chrome + language switcher (sets `locale` cookie), `proxy.ts` home redirect,
SEO/metadata/hreflang/sitemap, `/en/feed.xml` + `/en/llms.txt`, English About. Wire in English posts as they land. Build + lint clean.

**Phase 2 — Post bodies.** Translate all 8 MDX bodies + frontmatter (`title`, `summary`) to
natural English (no literal translation), translate image `alt`/`title` text, repoint image
paths to `/posts/<slug>/en/...`. Output to `content/en/posts/`.

**Phase 3 — Diagrams.** For each of 123 SVGs, create an English version under
`public/posts/<slug>/en/` with translated `<text>` and adjusted layout (width, x-anchor,
line breaks) to prevent overflow/overlap. Staged per post, visually verified.

**Phase 4 — English audio.** Extend `scripts/generate-audio.ts` with an English voice and an
English pronunciation glossary, reading `content/en/posts/`, output to
`public/posts/<slug>/en/audio.{mp3,json}`. English post pages detect `en/audio.mp3` to show
the Listen control.

**Phase 5 — History rewrite (final).** Translate the 42 Korean commit subjects/bodies to
English and rewrite via `git filter-repo` (message callback), then force-push `main`.
Accepted trade-off: all SHAs change; merged PRs (#1–#11) will reference old SHAs on GitHub.

## Testing / verification

- `lib/posts.test.ts`: add locale cases — `en` dir reading, slug mapping across locales,
  missing `en` post excluded from list and `getPostBySlug(..., 'en')` throwing/404.
- `pnpm build` succeeds with both locales' static routes generated.
- `pnpm lint` clean.
- Manual: verify `/` (ko) and `/en` render correct chrome, `<html lang>`, dates, hreflang,
  switcher behavior, feeds, and that a ko-only post 404s at `/en/<slug>`.
- Redirect: `curl -H 'Accept-Language: en-US' /` → 307 `/en`; `Accept-Language: ko` → 200;
  `Cookie: locale=ko` + English header → 200 (cookie wins); `/slug` never redirects.

## Risks

- **Multiple root layouts** interact with global files (`not-found`, `template`, metadata
  file conventions) — verify exact Next 16 placement during Phase 1.
- **SVG layout overflow** — English labels are longer; Phase 3 needs per-file layout care
  and visual checks, not blind text substitution.
- **History rewrite** — irreversible on remote; performed last, in isolation, with backup
  branch/tag before force-push.
