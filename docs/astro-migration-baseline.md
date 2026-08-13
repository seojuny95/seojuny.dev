# Astro Migration Baseline

Captured on 2026-08-13 from commit `e1465d7039c5c3825a792a71f5ea7e62e2ef52bb`.

The Astro implementation must preserve the public behavior documented here. Existing defects are recorded separately and should be corrected rather than reproduced.

## Environment

- Node.js 24.13.0
- pnpm 10.20.0
- Next.js 16.2.4
- 10 Korean posts and 10 English posts
- 302 files under `public/posts`
- 20 MP3 files and 20 sentence-timing JSON files

## Verification Baseline

- `pnpm test`: 90 tests passed across 5 files
- `pnpm typecheck`: passed
- `pnpm lint`: passed
- `pnpm build`: passed, 58 static pages generated
- Browser console: no warnings or errors on the tested home, post, search, and 404 flows

## Public Routes

| Purpose   | Korean      | English        |
| --------- | ----------- | -------------- |
| Home      | `/`         | `/en`          |
| About     | `/about`    | `/en/about`    |
| Post      | `/<slug>`   | `/en/<slug>`   |
| Feed      | `/feed.xml` | `/en/feed.xml` |
| LLM index | `/llms.txt` | `/en/llms.txt` |

Shared routes:

- `/sitemap.xml`
- `/robots.txt`
- `/manifest.webmanifest`
- `/icon.svg`
- `/apple-icon.png`
- `/opengraph-image`
- `/posts/<slug>/**`
- `/posts/<slug>/en/**`

All known content, feed, sitemap, manifest, OG, and audio endpoints returned the expected `200` response. Unknown Korean and English paths returned `404` with locale-appropriate content.

## Post Slugs

- `four-year-retrospective`
- `attention-is-all-you-need`
- `how-models-learn`
- `finetuning-and-peft`
- `what-is-rag`
- `advanced-rag`
- `what-is-multimodal`
- `multimodal-rag`
- `trusting-ai-code`
- `react-alive`

Each slug currently exists in both locales.

## Locale Routing

- A request to `/` with no locale cookie and an English `Accept-Language` redirects to `/en` with status `307`.
- A `locale=en` cookie redirects `/` to `/en` with status `307`.
- A `locale=ko` cookie keeps `/` in Korean even when `Accept-Language` prefers English.
- Locale detection only applies to `/`. Direct post and about URLs are never redirected.
- Switching locale on a translated post preserves the slug.
- Korean pages render with `lang="ko"`; English pages render with `lang="en"`.

## Metadata Contract

- Canonical URLs use `https://seojuny.dev`.
- Every tested page declares Korean, English, and Korean `x-default` hreflang links.
- Korean paths are unprefixed; English canonical paths use `/en`.
- Each post provides its localized title, summary, article metadata, publication date, tags, and OG image.
- The home pages advertise their localized Atom feeds.
- JSON-LD describes the website, author, and blog posts in the active language.

Representative post metadata:

| Field         | Korean                            | English                                     |
| ------------- | --------------------------------- | ------------------------------------------- |
| URL           | `/react-alive`                    | `/en/react-alive`                           |
| Title         | `React 살아있니? — seojuny.dev`   | `React, Are You Still Alive? — seojuny.dev` |
| Canonical     | `https://seojuny.dev/react-alive` | `https://seojuny.dev/en/react-alive`        |
| HTML language | `ko`                              | `en`                                        |

## Interaction Contract

- Desktop navigation exposes Posts, About, search, and locale switching.
- Mobile navigation opens and closes as a full-screen menu.
- Search opens from its button, accepts a query, and returns ranked localized results with keyboard affordances.
- The `React` query returns three Korean results, led by `React 살아있니?`.
- Post pages expose reading progress, table of contents, heading anchors, code copy controls, share control, comments, and adjacent-post navigation.
- The audio player loads `/posts/<slug>/audio.mp3` or its English counterpart, starts playback, pauses, changes rate, skips, and follows sentence timings.
- The tested Korean audio started at `1x` and paused successfully.
- Locale switching from `/react-alive` navigates to `/en/react-alive` and renders the English post.

## Visual Reference Set

The baseline includes these desktop and mobile captures:

- Korean home, desktop
- Korean home, mobile
- Korean mobile menu
- Korean React post, desktop and mobile
- English React post, desktop
- Korean mobile search results

Comparison should focus on layout dimensions, typography, spacing, borders, responsive behavior, interaction overlays, and settled page-transition state.

## Existing Defects to Correct

- The build reports CSS parser warnings for `::highlight(reading)` even though the browser renders the Highlight API styling.
- The build reports missing `metadataBase` while generating some social image routes.
- The Korean home page does not emit an `og:image`, while the English home page does.
- About pages inherit the home page `og:url` instead of using their own canonical URL.
- Post JSON-LD points to the stable `/opengraph-image` path, but the current Next.js generated route is hashed and the stable path returns `404`.

These behaviors are not compatibility requirements. The Astro version should remove the warnings and emit valid, consistent metadata and OG image URLs.

## Migration Acceptance Criteria

The migration is ready for final review when:

1. All public routes and assets remain available without URL changes.
2. Locale routing, switching, cookies, 404 pages, canonical URLs, and hreflang links match the contract.
3. Content and frontmatter produce the same visible post data without editing prose.
4. The representative desktop and mobile views match the visual reference set.
5. Search, audio, comments, navigation, sharing, and code controls work without browser errors.
6. Feeds, sitemap, robots, manifest, JSON-LD, and OG images validate in both locales.
7. Tests, type checking, linting, the production build, and the Vercel Preview deployment pass.
