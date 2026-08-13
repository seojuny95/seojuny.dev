# Seo Jun Yoo — seojuny.dev

My personal blog — a place where I learn the things I'm curious about as a developer and write them down. Each post is me working something out in the open: what I read, what I built, and what I got wrong along the way.

The site itself is the real evidence of how I build and design modern web experiences.

Live at **[seojuny.dev](https://seojuny.dev)**.

## About me

I'm a software engineer with four years of experience, working mainly with **Next.js, React, and TypeScript**.

Two things pull my attention. First, **frontend** — building interfaces that feel fast and considered. Second, **AI engineering**, where I'm drawn to the practical craft of making language models genuinely useful: RAG, prompt engineering, agent design, and the harness and tooling that hold it all together. I'm most interested in roles where those two meet — building the product surface for AI-powered experiences.

> Email: [sytwoyou@gmail.com](mailto:sytwoyou@gmail.com) / Tel: +82 10 2677 2535

## Tech

A file-based MDX blog published in Korean and English. Content pages are statically generated with Astro and deployed to Vercel; the root route runs on demand to select a language from the locale cookie and `Accept-Language` header.

- **Astro 7** with Content Collections
- **React 19** islands for interactive UI
- **TypeScript** and **Tailwind CSS 4**
- **MDX** with KaTeX math and Shiki syntax highlighting
- **Vercel** adapter, Web Analytics, sitemap, feeds, and generated OG images
- **Vitest**, ESLint, Prettier, Husky, lint-staged, and commitlint

## Local development

Node.js 24 and pnpm 11 are used by the project.

```bash
corepack enable
corepack pnpm install
corepack pnpm dev
```

The development server runs at [http://localhost:4321](http://localhost:4321).

| Command                        | Description                                     |
| ------------------------------ | ----------------------------------------------- |
| `corepack pnpm dev`            | Start the development server                    |
| `corepack pnpm build`          | Build the Vercel production output              |
| `corepack pnpm test`           | Run the Vitest suite                            |
| `corepack pnpm test:watch`     | Run Vitest in watch mode                        |
| `corepack pnpm lint`           | Run ESLint                                      |
| `corepack pnpm typecheck`      | Run Astro and TypeScript diagnostics            |
| `corepack pnpm format`         | Format the project with Prettier                |
| `corepack pnpm verify`         | Run formatting, lint, types, tests, and a build |
| `corepack pnpm generate:audio` | Generate post audio and sentence timings        |

## Content

- Korean posts: `src/content/posts/ko/YYYY-MM-DD-slug.mdx`
- English posts: `src/content/posts/en/YYYY-MM-DD-slug.mdx`
- About pages: `src/content/about/{ko,en}.mdx`
- Post assets: `public/posts/<slug>`
- English audio: `public/posts/<slug>/en`

Each post requires `title` and `date` frontmatter. `summary`, `tags`, and `draft` are optional. The page title supplies the `h1`, so post bodies begin at `##`.

Korean routes are unprefixed (`/`, `/<slug>`), while English routes live under `/en` (`/en`, `/en/<slug>`).

### Audio generation

Audio generation runs locally through Edge TTS and requires `ffmpeg`/`ffprobe`. Generated `audio.mp3` and `audio.json` files are committed with the post.

```bash
corepack pnpm generate:audio                 # Korean posts missing audio
corepack pnpm generate:audio react-alive     # One Korean post
corepack pnpm generate:audio --en            # English posts missing audio
corepack pnpm generate:audio --en react-alive
corepack pnpm generate:audio --all            # Regenerate all Korean audio
corepack pnpm generate:audio --en --all       # Regenerate all English audio
```

Pre-commit hooks format and lint staged files. Commit messages follow Conventional Commits, and the pre-push hook runs the full verification suite.

Production behavior is checked with `corepack pnpm verify` and a Vercel Preview deployment; Astro's local preview server does not serve this adapter output.
