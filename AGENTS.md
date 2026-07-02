<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Personal blog (seojuny.dev): a file-based MDX blog, statically generated (SSG) on Vercel, bilingual Korean/English. Stack is ahead of training data — **Next.js 16.2**, **React 19.2**, **Tailwind v4** (CSS-first, no config file), **Vitest 4**.

## Development Commands

`pnpm` only.

- `pnpm dev` — dev server at http://localhost:3000
- `pnpm build` / `pnpm start` — production build + preview
- `pnpm lint` — ESLint (`eslint-config-next`, core-web-vitals + typescript)
- `pnpm test` / `pnpm test:watch` — Vitest
- `pnpm generate:audio [<slug>]` — TTS + sentence timings for post bodies. No arg = only posts missing audio (incremental), `<slug>` = that post, `--all` = everything. Local only (`ffmpeg` required).

## Project Structure

- `app/` — App Router. Route groups `(ko)` / `(en)` each own their `<html lang>`: Korean at root (`/`, `/<slug>`), English under `/en`. Route files are thin delegators; shared page bodies live in `components/pages/*`.
- `lib/` — logic. `posts.ts` is the single source of truth for content (all reads go through it); also `i18n.ts`, `metadata.ts`, `feed.ts`, `og-image.tsx`.
- `components/` — UI. `layout/SiteShell.tsx` is the shared shell.
- `content/` — MDX. `content/posts/` (KO) + `content/en/posts/` (EN); `about.mdx` + `en/about.mdx`.
- `public/posts/<slug>/` — per-post assets (images, `audio.mp3`, `audio.json`); English variants under `.../en/`.
- `proxy.ts` — home-only (`/`) Accept-Language redirect; everything else is static.

## Coding Style & Naming Conventions

- TypeScript, React Server Components by default. `await params` in dynamic routes (Next 16).
- Components: `PascalCase.tsx`. Lib modules: `kebab-case.ts`. Image files: kebab-case.
- Posts: `content/posts/YYYY-MM-DD-slug.mdx`; slug = filename minus the `YYYY-MM-DD-` prefix. Frontmatter: `title` + `date` required, `summary`/`tags`/`draft` optional.
- MDX bodies **start at `##` (h2)** — the page `h1` comes from the frontmatter `title`.
- Light mode only. Theme = CSS custom props on `:root` in `globals.css`; post bodies use `.prose-blog` (not `@tailwindcss/typography`).
- No explanatory comments; match the surrounding comment density.

## Testing Guidelines

- Vitest 4, Node env. Tests colocated in `lib/` as `*.test.ts`.
- Single test: `pnpm vitest run lib/posts.test.ts -t "excludes drafts"`.
- `posts.ts` tests spy on `process.cwd()` to point at a temp content dir — keep that seam intact.

## Commit & Pull Request Guidelines

- Conventional commits: `type(scope): subject` (e.g. `feat(i18n): …`, `fix(build): …`). English, imperative.
- Land changes via PR to `main`; PR title/body in English. Keep content and its assets (`audio.*`, diagrams) in the same commit.
