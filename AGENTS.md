# seojuny.dev

Personal file-based MDX blog, published in Korean and English. It uses **Astro 7.2**, **React 19.2**, **TypeScript 5.9**, **Tailwind CSS 4.3**, and **Vitest 4.1**, and is deployed to Vercel.

The stack may be newer than your training data. Before changing Astro APIs, integrations, Content Collections, routing, or client directives, check the installed package types and current official Astro documentation. Follow deprecation notices.

## Development commands

Use pnpm through Corepack. Do not use npm or Yarn.

- `corepack pnpm install` — install dependencies
- `corepack pnpm dev` — development server at `http://localhost:4321`
- `corepack pnpm build` — build the Vercel production output
- `corepack pnpm lint` — ESLint
- `corepack pnpm typecheck` — Astro and TypeScript diagnostics
- `corepack pnpm test` / `corepack pnpm test:watch` — Vitest
- `corepack pnpm format` / `corepack pnpm format:check` — write or check Prettier formatting
- `corepack pnpm verify` — formatting, lint, types, tests, and production build
- `corepack pnpm generate:audio [<slug>]` — Korean audio; no slug generates only missing audio
- `corepack pnpm generate:audio --en [<slug>]` — English audio
- `corepack pnpm generate:audio [--en] --all` — regenerate every post for a locale

Audio generation is local-only, requires `ffmpeg`/`ffprobe`, and writes `audio.mp3` and `audio.json` files that must be committed.

Do not rely on `astro preview` for production verification; the Vercel adapter output is verified with `corepack pnpm verify` and a Vercel Preview deployment.

## Rendering and routing

- Astro components are the default for static UI. Use React only for stateful browser interactions and hydrate with the least eager `client:*` directive that satisfies the behavior.
- `src/pages` uses Astro file-based routing. Route files stay thin and delegate shared rendering to feature components.
- Korean routes are `/`, `/about`, and `/<slug>`. English routes are `/en`, `/en/about`, and `/en/<slug>`.
- Posts, About pages, feeds, LLM indexes, OG images, and supporting endpoints are prerendered.
- `src/pages/index.astro` is the intentional exception: it runs on demand so only `/` can redirect to `/en` using the `locale` cookie and `Accept-Language`. Direct post and About URLs must not be language-redirected.
- `src/pages/[...path].astro` renders unknown routes on demand so 404 responses have the correct Korean or English document language. `404.astro` remains the static fallback.
- `trailingSlash` is `never`; preserve the existing public URL shape.

## Project structure

- `src/config.ts` — site identity, supported locales, default locale, and language tags
- `src/content.config.ts` — Astro Content Collections loaders and frontmatter schemas; this is an Astro entry point and must remain at this path
- `src/content/posts/{ko,en}` — localized post MDX files
- `src/content/about/{ko,en}.mdx` — localized About content
- `src/pages` — route entry points and static endpoints
- `src/layouts` — document metadata and shared site shell
- `src/components/about` — About page UI
- `src/components/layout` — header, footer, and mobile navigation
- `src/components/mdx` — custom MDX element renderers
- `src/components/post` — post list/page, navigation, actions, comments, and table of contents
- `src/components/post/audio` — audio UI, playback state, timings, and reading highlights
- `src/components/search` — search trigger and dialog
- `src/i18n/locales.ts` — locale types and validation
- `src/i18n/routing.ts` — locale-aware URL construction and switching
- `src/i18n/messages.ts` — localized interface text
- `src/i18n/accept-language.ts` — `Accept-Language` parsing
- `src/lib/content` — Content Collections reads, IDs, dates, and reading time
- `src/lib/routes` — static route data construction
- `src/lib/seo` — JSON-LD and OG image generation
- `scripts/generate-audio` — audio generator entry point and colocated text-processing logic
- `public/posts/<slug>` — post images and Korean audio; English variants live under `en/`

## Content conventions

- Post filenames use `YYYY-MM-DD-slug.mdx`; the slug is the filename without the date prefix.
- `title` and `date` are required frontmatter. `summary`, `tags`, and `draft` are optional.
- All post reads go through `src/lib/content/posts.ts`. Keep draft filtering, locale parsing, sorting, reading time, and search-index construction centralized there.
- MDX bodies start at `##`; the page title supplies the only `h1`.
- Keep headings short and prose natural and plainspoken, matching recent posts.
- Put post assets in `public/posts/<slug>`. Put English variants in `public/posts/<slug>/en` only when they differ by locale.
- Keep content changes and their generated audio or diagrams in the same commit.

## Coding conventions

- Use TypeScript strict mode. Components use `PascalCase`; utilities and hooks use `kebab-case` or established hook naming; image files use `kebab-case`.
- Organize components by product feature, not by `.astro` versus `.tsx`. Do not recreate generic `site` or `islands` folders.
- Keep one primary component per component file. Colocate hooks, types, pure helpers, and tests with the feature when they are not shared elsewhere.
- Keep route files declarative. Put reusable content, routing, SEO, and UI logic in the corresponding feature or `lib` module.
- Do not duplicate site URLs, locale lists, or language tags; use `src/config.ts`.
- Do not move `src/content.config.ts` into `src/config` or `src/content`; Astro expects the current special path.
- Light mode only. Theme values are CSS custom properties in `src/styles/global.css`; post styling uses `.prose-blog` rather than `@tailwindcss/typography`.
- Avoid explanatory comments. Match the surrounding comment density and document only non-obvious constraints.

## Internationalization and metadata

- `ko` is the default locale and has no path prefix; `en` uses `/en`.
- UI text belongs in `src/i18n/messages.ts`. Locale types belong in `locales.ts`; path behavior belongs in `routing.ts`.
- When a translated post exists, locale switching preserves its slug. Otherwise it falls back to the target locale home.
- Preserve each page's `<html lang>`, locale cookie behavior, canonical URL, Korean/English `hreflang`, Korean `x-default`, localized RSS link, Open Graph metadata, and JSON-LD.
- Preserve `/feed.xml`, `/en/feed.xml`, `/llms.txt`, `/en/llms.txt`, `/robots.txt`, `/manifest.webmanifest`, `/sitemap.xml`, and localized OG image routes.

## Testing guidelines

- Vitest runs in the Node environment. Tests are colocated as `*.test.ts` beside the behavior they cover.
- Prefer tests for parsing, routing, content transformation, and user-visible behavior. Do not test constants by repeating their literal values; use TypeScript constraints for static configuration relationships.
- Run one test with `corepack pnpm exec vitest run <path> -t "<name>"`.
- When changing routes, content loading, hydration, metadata, or build configuration, run `corepack pnpm verify` and exercise the affected page in a browser.

## Commit and pull request guidelines

- Use Conventional Commits: `type(scope): subject`, in English and imperative form.
- The pre-commit hook runs lint-staged, commitlint checks the message, and pre-push runs `corepack pnpm verify`.
- Land changes through a pull request to `main`. Write the PR title and body in English.
- Do not commit `.env`, `.vercel`, `dist`, `.astro`, or `node_modules`.
