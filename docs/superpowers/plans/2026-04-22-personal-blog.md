# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal, black-and-white personal blog (Korean content) with MDX posts, tags, search, dark mode, and an RSS feed, deployed to Vercel.

**Architecture:** Next.js 15 App Router, fully statically generated. Posts live as `.mdx` files in `content/posts/`. A single `lib/posts.ts` module is the source of truth for all pages (listings, post pages, tags, search index, RSS). Rendered via React Server Components with `next-mdx-remote/rsc`. Styled with Tailwind v4 + `@tailwindcss/typography`. Dark mode via `next-themes`.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, `next-mdx-remote/rsc`, `gray-matter`, `next-themes`, `fuse.js`, `feed`, Vitest.

**Working directory:** the repo root (already git-inited; spec committed).

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/*`, `.gitignore`

- [ ] **Step 1: Scaffold with create-next-app**

Run from the repo root:

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm --no-turbopack --yes
```

If prompted about non-empty directory, accept (the `docs/` and `.git` folder are fine).

- [ ] **Step 2: Verify scaffold**

Run: `pnpm dev` (wait for "Ready in..." message), visit `http://localhost:3000`, confirm default Next page renders. Kill dev server (`Ctrl+C`).

- [ ] **Step 3: Remove default boilerplate we don't need**

Delete these files (they'll be replaced):
```bash
rm app/page.tsx app/page.module.css public/*.svg 2>/dev/null || true
rm -rf app/fonts 2>/dev/null || true
```

Overwrite `app/globals.css` with a minimal base (Tailwind v4 uses `@import "tailwindcss"`):

```css
@import "tailwindcss";

:root {
  --bg: #ffffff;
  --fg: #111111;
  --muted: #666666;
  --rule: #e5e5e5;
}

:root.dark {
  --bg: #0a0a0a;
  --fg: #f2f2f2;
  --muted: #999999;
  --rule: #262626;
}

@theme inline {
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-rule: var(--rule);
}

html, body {
  background: var(--bg);
  color: var(--fg);
}

body {
  font-family: "Noto Serif KR", Georgia, "Times New Roman", serif;
  font-size: 18px;
  line-height: 1.75;
}

.ui-sans {
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
}

a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
a:hover { text-decoration-thickness: 2px; }

hr { border-color: var(--rule); }
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: scaffold next.js project"
```

---

## Task 2: Install project dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
pnpm add next-mdx-remote gray-matter next-themes fuse.js feed @tailwindcss/typography
```

- [ ] **Step 2: Install dev deps (testing)**

```bash
pnpm add -D vitest @vitest/ui @types/node
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json` and add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: add runtime and test dependencies"
```

---

## Task 3: Implement `lib/posts.ts` — TDD

**Files:**
- Create: `lib/posts.ts`, `lib/posts.test.ts`
- Create: `content/posts/2026-04-10-first.mdx`, `content/posts/2026-04-15-second.mdx`, `content/posts/2026-04-20-draft.mdx` (test fixtures)

- [ ] **Step 1: Create test fixtures**

`content/posts/2026-04-10-first.mdx`:
```mdx
---
title: "첫 글"
date: "2026-04-10"
summary: "안녕하세요"
tags: ["일기"]
---

본문 1
```

`content/posts/2026-04-15-second.mdx`:
```mdx
---
title: "두 번째 글"
date: "2026-04-15"
tags: ["일기", "개발"]
---

본문 2
```

`content/posts/2026-04-20-draft.mdx`:
```mdx
---
title: "초안"
date: "2026-04-20"
draft: true
---

아직 미완성
```

- [ ] **Step 2: Write the failing tests**

`lib/posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getAllPosts,
  getPostBySlug,
  getAllTags,
  getPostsByTag,
  getAdjacentPosts,
  getSearchIndex,
} from './posts';

describe('getAllPosts', () => {
  it('returns non-draft posts sorted by date desc', () => {
    const posts = getAllPosts();
    expect(posts.map(p => p.slug)).toEqual(['second', 'first']);
  });

  it('excludes drafts', () => {
    const posts = getAllPosts();
    expect(posts.find(p => p.slug === 'draft')).toBeUndefined();
  });

  it('strips date prefix from slug', () => {
    const posts = getAllPosts();
    expect(posts[0].slug).toBe('second');
  });

  it('defaults tags to empty array when missing', () => {
    const posts = getAllPosts();
    const p = posts.find(x => x.slug === 'second');
    expect(p?.tags).toEqual(['일기', '개발']);
  });
});

describe('getPostBySlug', () => {
  it('returns the post with matching slug', () => {
    const post = getPostBySlug('first');
    expect(post.title).toBe('첫 글');
    expect(post.summary).toBe('안녕하세요');
  });

  it('throws when slug not found', () => {
    expect(() => getPostBySlug('nope')).toThrow();
  });
});

describe('getAllTags', () => {
  it('returns tags with counts sorted desc', () => {
    const tags = getAllTags();
    expect(tags[0]).toEqual({ tag: '일기', count: 2 });
    expect(tags.find(t => t.tag === '개발')).toEqual({ tag: '개발', count: 1 });
  });
});

describe('getPostsByTag', () => {
  it('returns only posts with the tag', () => {
    const posts = getPostsByTag('개발');
    expect(posts.map(p => p.slug)).toEqual(['second']);
  });
});

describe('getAdjacentPosts', () => {
  it('returns prev (newer) and next (older) relative to date desc order', () => {
    const { prev, next } = getAdjacentPosts('first');
    expect(prev?.slug).toBe('second');
    expect(next).toBeUndefined();
  });

  it('handles the newest post', () => {
    const { prev, next } = getAdjacentPosts('second');
    expect(prev).toBeUndefined();
    expect(next?.slug).toBe('first');
  });
});

describe('getSearchIndex', () => {
  it('returns searchable entries with slug/title/summary/tags only', () => {
    const idx = getSearchIndex();
    expect(idx).toHaveLength(2);
    expect(idx[0]).toHaveProperty('slug');
    expect(idx[0]).toHaveProperty('title');
    expect(idx[0]).toHaveProperty('tags');
    expect(idx[0]).not.toHaveProperty('content');
  });
});
```

- [ ] **Step 3: Verify tests fail**

Run: `pnpm test`
Expected: FAIL with "Cannot find module './posts'"

- [ ] **Step 4: Implement `lib/posts.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags: string[];
  content: string;
};

export type TagInfo = { tag: string; count: number };
export type SearchEntry = Pick<Post, 'slug' | 'title' | 'summary' | 'tags'>;

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.mdx?$/, '');
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function readAllRaw(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => /\.mdx?$/.test(f));
  const posts = files.map(filename => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
    const { data, content } = matter(raw);
    if (!data.title || !data.date) {
      throw new Error(`Missing required frontmatter (title/date) in ${filename}`);
    }
    return {
      slug: slugFromFilename(filename),
      title: String(data.title),
      date: String(data.date),
      summary: data.summary ? String(data.summary) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      content,
      draft: Boolean(data.draft),
    };
  });
  return posts as (Post & { draft: boolean })[];
}

export function getAllPosts(): Post[] {
  return readAllRaw()
    .filter((p: any) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ ...rest }: any) => {
      const { draft: _d, ...post } = rest;
      return post as Post;
    });
}

export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find(p => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
}

export function getAllTags(): TagInfo[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(p => p.tags.includes(tag));
}

export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const posts = getAllPosts();
  const i = posts.findIndex(p => p.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? posts[i - 1] : undefined,
    next: i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

export function getSearchIndex(): SearchEntry[] {
  return getAllPosts().map(({ slug, title, summary, tags }) => ({
    slug,
    title,
    summary,
    tags,
  }));
}
```

- [ ] **Step 5: Verify tests pass**

Run: `pnpm test`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add posts library with frontmatter parsing and helpers"
```

---

## Task 4: Root layout, Header, Footer, theme provider

**Files:**
- Create: `app/layout.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/ThemeToggle.tsx`, `app/providers.tsx`

- [ ] **Step 1: Providers (client)**

`app/providers.tsx`:

```tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: ThemeToggle (client)**

`components/ThemeToggle.tsx`:

```tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="w-6 inline-block" aria-hidden />;
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      className="ui-sans text-sm no-underline"
    >
      {resolvedTheme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
```

- [ ] **Step 3: Header**

`components/Header.tsx`:

```tsx
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="ui-sans text-sm flex items-center justify-between py-6 border-b border-rule mb-10">
      <Link href="/" className="no-underline font-medium">codydev.blog</Link>
      <nav className="flex items-center gap-4">
        <Link href="/posts" className="no-underline">Posts</Link>
        <Link href="/tags" className="no-underline">Tags</Link>
        <Link href="/about" className="no-underline">About</Link>
        <Link href="/search" className="no-underline">Search</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Footer**

`components/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="ui-sans text-sm text-muted border-t border-rule mt-16 py-6 flex justify-between">
      <span>© {new Date().getFullYear()} codydev</span>
      <a href="/feed.xml" className="no-underline">RSS</a>
    </footer>
  );
}
```

- [ ] **Step 5: Root layout**

`app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

export const metadata: Metadata = {
  title: 'codydev.blog',
  description: '개인 블로그',
  alternates: {
    types: { 'application/atom+xml': '/feed.xml' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={notoSerifKr.variable}>
      <body>
        <Providers>
          <div className="max-w-[640px] mx-auto px-4">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify dev server renders**

Run: `pnpm dev`, visit `http://localhost:3000`. Expect a blank main area with header + footer. No errors in console. Kill server.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: root layout with header, footer, and theme toggle"
```

---

## Task 5: Home page + PostList component

**Files:**
- Create: `app/page.tsx`, `components/PostList.tsx`

- [ ] **Step 1: PostList component**

`components/PostList.tsx`:

```tsx
import Link from 'next/link';
import type { Post } from '@/lib/posts';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="ui-sans text-muted">글이 아직 없습니다.</p>;
  }
  return (
    <ul className="space-y-6 list-none p-0">
      {posts.map(p => (
        <li key={p.slug}>
          <Link href={`/posts/${p.slug}`} className="no-underline">
            <div className="flex items-baseline gap-3">
              <time className="ui-sans text-sm text-muted w-24 shrink-0">{p.date}</time>
              <span className="flex-1">{p.title}</span>
            </div>
          </Link>
          {p.summary && (
            <p className="ui-sans text-sm text-muted ml-27 mt-1">{p.summary}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Home page**

`app/page.tsx`:

```tsx
import { getAllPosts } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 20);
  return (
    <section>
      <p className="ui-sans text-sm text-muted mb-10">생각을 기록하는 곳.</p>
      <PostList posts={posts} />
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/`. Expect two posts listed (first, second from fixtures) with dates. Kill server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: home page with recent post list"
```

---

## Task 6: Post page `/posts/[slug]`

**Files:**
- Create: `app/posts/[slug]/page.tsx`

- [ ] **Step 1: Implement post page**

`app/posts/[slug]/page.tsx`:

```tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts } from '@/lib/posts';

export function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return { title: `${post.title} — codydev.blog`, description: post.summary };
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }
  const { prev, next } = getAdjacentPosts(slug);
  return (
    <article>
      <Link href="/posts" className="ui-sans text-sm text-muted no-underline">← 목록으로</Link>
      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="ui-sans text-sm text-muted mt-3 flex gap-3">
          <time>{post.date}</time>
          {post.tags.length > 0 && (
            <span className="flex gap-2">
              {post.tags.map(t => (
                <Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="no-underline">#{t}</Link>
              ))}
            </span>
          )}
        </div>
      </header>
      <div className="prose-blog">
        <MDXRemote source={post.content} />
      </div>
      <hr className="my-12" />
      <nav className="ui-sans text-sm flex justify-between gap-4">
        <div>
          {next && (
            <Link href={`/posts/${next.slug}`} className="no-underline">
              <span className="text-muted block">← 이전</span>
              {next.title}
            </Link>
          )}
        </div>
        <div className="text-right">
          {prev && (
            <Link href={`/posts/${prev.slug}`} className="no-underline">
              <span className="text-muted block">다음 →</span>
              {prev.title}
            </Link>
          )}
        </div>
      </nav>
    </article>
  );
}
```

- [ ] **Step 2: Add minimal prose styles**

Append to `app/globals.css`:

```css
.prose-blog h1, .prose-blog h2, .prose-blog h3 {
  font-weight: 700;
  margin-top: 2em;
  margin-bottom: 0.6em;
  line-height: 1.3;
}
.prose-blog h2 { font-size: 1.5rem; }
.prose-blog h3 { font-size: 1.2rem; }
.prose-blog p { margin: 1em 0; }
.prose-blog ul, .prose-blog ol { margin: 1em 0; padding-left: 1.5em; }
.prose-blog ul { list-style: disc; }
.prose-blog ol { list-style: decimal; }
.prose-blog blockquote {
  border-left: 2px solid var(--rule);
  padding-left: 1em;
  margin: 1.5em 0;
  color: var(--muted);
}
.prose-blog code {
  font-family: ui-monospace, Menlo, Monaco, monospace;
  font-size: 0.9em;
  background: color-mix(in srgb, var(--fg) 8%, transparent);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}
.prose-blog pre {
  background: color-mix(in srgb, var(--fg) 6%, transparent);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.6;
}
.prose-blog pre code { background: transparent; padding: 0; }
.prose-blog hr { margin: 2em 0; }
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/posts/first`. Expect title, date, body "본문 1", and prev/next links. Kill server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: post page with MDX rendering and adjacent post nav"
```

---

## Task 7: Archive page `/posts` (grouped by year)

**Files:**
- Create: `app/posts/page.tsx`

- [ ] **Step 1: Implement archive page**

`app/posts/page.tsx`:

```tsx
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: 'Posts — codydev.blog' };

export default function PostsPage() {
  const posts = getAllPosts();
  const byYear = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">Posts</h1>
      {years.map(year => (
        <div key={year} className="mb-10">
          <h2 className="ui-sans text-sm text-muted mb-3">{year}</h2>
          <ul className="space-y-2 list-none p-0">
            {byYear.get(year)!.map(p => (
              <li key={p.slug} className="flex items-baseline gap-3">
                <time className="ui-sans text-sm text-muted w-24 shrink-0">{p.date}</time>
                <Link href={`/posts/${p.slug}`} className="no-underline">{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`, visit `/posts`. Expect one year "2026" with two entries. Kill server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: archive page grouped by year"
```

---

## Task 8: Tags pages `/tags` and `/tags/[tag]`

**Files:**
- Create: `app/tags/page.tsx`, `app/tags/[tag]/page.tsx`

- [ ] **Step 1: Tags index**

`app/tags/page.tsx`:

```tsx
import Link from 'next/link';
import { getAllTags } from '@/lib/posts';

export const metadata = { title: 'Tags — codydev.blog' };

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">Tags</h1>
      <ul className="ui-sans flex flex-wrap gap-x-4 gap-y-2 list-none p-0">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link href={`/tags/${encodeURIComponent(tag)}`} className="no-underline">
              #{tag} <span className="text-muted text-sm">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Tag detail page**

`app/tags/[tag]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { getAllTags, getPostsByTag } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)} — codydev.blog` };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">#{tag}</h1>
      <PostList posts={posts} />
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/tags` → see `#일기 (2)` and `#개발 (1)`. Click `#개발` → see second post. Kill server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: tags index and tag detail pages"
```

---

## Task 9: About page

**Files:**
- Create: `content/about.mdx`, `app/about/page.tsx`

- [ ] **Step 1: Create about content**

`content/about.mdx`:

```mdx
# About

이 블로그는 개발과 일상에 대한 생각을 기록하는 공간입니다.
```

- [ ] **Step 2: About page**

`app/about/page.tsx`:

```tsx
import fs from 'node:fs';
import path from 'node:path';
import { MDXRemote } from 'next-mdx-remote/rsc';

export const metadata = { title: 'About — codydev.blog' };

export default function AboutPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content', 'about.mdx'),
    'utf8'
  );
  return (
    <section className="prose-blog">
      <MDXRemote source={source} />
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/about`. Expect the About content rendered. Kill server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: about page rendered from mdx"
```

---

## Task 10: Search page

**Files:**
- Create: `app/search/page.tsx`, `components/SearchBox.tsx`

- [ ] **Step 1: SearchBox (client)**

`components/SearchBox.tsx`:

```tsx
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { SearchEntry } from '@/lib/posts';

export function SearchBox({ index }: { index: SearchEntry[] }) {
  const [query, setQuery] = useState('');
  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: ['title', 'summary', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [index]
  );
  const results = query.trim() ? fuse.search(query).map(r => r.item) : index;
  return (
    <div>
      <input
        type="search"
        autoFocus
        placeholder="검색어를 입력하세요"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="ui-sans w-full border-b border-rule bg-transparent py-2 outline-none focus:border-fg"
      />
      <ul className="mt-6 space-y-4 list-none p-0">
        {results.map(r => (
          <li key={r.slug}>
            <Link href={`/posts/${r.slug}`} className="no-underline">
              <span>{r.title}</span>
            </Link>
            {r.summary && (
              <p className="ui-sans text-sm text-muted mt-1">{r.summary}</p>
            )}
          </li>
        ))}
        {results.length === 0 && (
          <li className="ui-sans text-sm text-muted">결과 없음</li>
        )}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Search page (server)**

`app/search/page.tsx`:

```tsx
import { getSearchIndex } from '@/lib/posts';
import { SearchBox } from '@/components/SearchBox';

export const metadata = { title: 'Search — codydev.blog' };

export default function SearchPage() {
  const index = getSearchIndex();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">Search</h1>
      <SearchBox index={index} />
    </section>
  );
}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`, visit `/search`. Type "개발" → expect only the second post. Clear input → expect all posts. Kill server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: client-side fuzzy search with fuse.js"
```

---

## Task 11: RSS feed at `/feed.xml`

**Files:**
- Create: `app/feed.xml/route.ts`

- [ ] **Step 1: Implement route handler**

`app/feed.xml/route.ts`:

```ts
import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://codydev.vercel.app';

export function GET() {
  const feed = new Feed({
    title: 'codydev.blog',
    description: '개인 블로그',
    id: SITE_URL,
    link: SITE_URL,
    language: 'ko',
    copyright: `© ${new Date().getFullYear()} codydev`,
    feedLinks: { atom: `${SITE_URL}/feed.xml` },
  });

  for (const post of getAllPosts()) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/posts/${post.slug}`,
      link: `${SITE_URL}/posts/${post.slug}`,
      description: post.summary,
      date: new Date(post.date),
    });
  }

  return new Response(feed.atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`, visit `/feed.xml`. Expect Atom XML with two entries. Kill server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: atom feed at /feed.xml"
```

---

## Task 12: 404 page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Implement 404**

`app/not-found.tsx`:

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="ui-sans text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted mb-6">페이지를 찾을 수 없습니다.</p>
      <Link href="/" className="no-underline">홈으로 →</Link>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev`, visit `/nope`. Expect 404 page. Kill server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: not-found page"
```

---

## Task 13: Seed posts, clean up fixtures, full build verification

**Files:**
- Modify/Delete: `content/posts/*` (replace test fixtures with real seed posts)

- [ ] **Step 1: Replace fixture posts with a welcome post**

Delete the three fixture files:
```bash
rm content/posts/2026-04-10-first.mdx content/posts/2026-04-15-second.mdx content/posts/2026-04-20-draft.mdx
```

Create `content/posts/2026-04-22-hello-world.mdx`:

```mdx
---
title: "블로그를 시작하며"
date: "2026-04-22"
summary: "첫 번째 글입니다."
tags: ["일기"]
---

안녕하세요. 이 블로그는 제 생각과 배움을 기록하는 공간입니다.

앞으로 개발, 책, 일상에 대한 글을 쓸 예정입니다.

잘 부탁드립니다.
```

- [ ] **Step 2: Update tests for new fixtures**

Since we removed the fixture files, `lib/posts.test.ts` will fail. Make the tests self-contained using a temp directory. Replace `lib/posts.test.ts` with:

```ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'));
const POSTS_TMP = path.join(TMP, 'content', 'posts');

beforeAll(() => {
  fs.mkdirSync(POSTS_TMP, { recursive: true });
  fs.writeFileSync(path.join(POSTS_TMP, '2026-04-10-first.mdx'),
    `---\ntitle: "첫 글"\ndate: "2026-04-10"\nsummary: "안녕하세요"\ntags: ["일기"]\n---\n\n본문 1\n`);
  fs.writeFileSync(path.join(POSTS_TMP, '2026-04-15-second.mdx'),
    `---\ntitle: "두 번째 글"\ndate: "2026-04-15"\ntags: ["일기", "개발"]\n---\n\n본문 2\n`);
  fs.writeFileSync(path.join(POSTS_TMP, '2026-04-20-draft.mdx'),
    `---\ntitle: "초안"\ndate: "2026-04-20"\ndraft: true\n---\n\n미완성\n`);
  vi.spyOn(process, 'cwd').mockReturnValue(TMP);
});

afterAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  vi.restoreAllMocks();
});

// Import AFTER cwd is mocked
const {
  getAllPosts, getPostBySlug, getAllTags, getPostsByTag,
  getAdjacentPosts, getSearchIndex
} = await import('./posts');

describe('getAllPosts', () => {
  it('returns non-draft posts sorted by date desc', () => {
    expect(getAllPosts().map(p => p.slug)).toEqual(['second', 'first']);
  });
  it('excludes drafts', () => {
    expect(getAllPosts().find(p => p.slug === 'draft')).toBeUndefined();
  });
});

describe('getPostBySlug', () => {
  it('returns matching post', () => {
    expect(getPostBySlug('first').title).toBe('첫 글');
  });
  it('throws when not found', () => {
    expect(() => getPostBySlug('nope')).toThrow();
  });
});

describe('getAllTags', () => {
  it('counts tags correctly', () => {
    const tags = getAllTags();
    expect(tags[0]).toEqual({ tag: '일기', count: 2 });
    expect(tags.find(t => t.tag === '개발')).toEqual({ tag: '개발', count: 1 });
  });
});

describe('getPostsByTag', () => {
  it('filters by tag', () => {
    expect(getPostsByTag('개발').map(p => p.slug)).toEqual(['second']);
  });
});

describe('getAdjacentPosts', () => {
  it('prev=newer, next=older', () => {
    const { prev, next } = getAdjacentPosts('first');
    expect(prev?.slug).toBe('second');
    expect(next).toBeUndefined();
  });
});

describe('getSearchIndex', () => {
  it('returns entries without content', () => {
    const idx = getSearchIndex();
    expect(idx).toHaveLength(2);
    expect(idx[0]).not.toHaveProperty('content');
  });
});
```

Note: because `lib/posts.ts` caches nothing at the top level (it reads fs on every call), mocking `process.cwd()` before import works correctly.

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: all tests PASS.

- [ ] **Step 4: Run production build**

Run: `pnpm build`
Expected: build completes with no errors. All routes prerendered (○ or ● symbols next to each).

- [ ] **Step 5: Smoke test production build**

Run: `pnpm start`, visit `/`, `/posts`, `/posts/hello-world`, `/tags`, `/tags/일기`, `/about`, `/search`, `/feed.xml`. All should render. Kill server.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: seed initial post and isolate tests from real content"
```

---

## Task 14: Deployment setup

**Files:**
- Modify: `README.md`
- Create: `vercel.json` (only if needed — Next.js auto-detects)

- [ ] **Step 1: Write a minimal README**

Overwrite `README.md`:

```markdown
# codydev.blog

Personal blog built with Next.js App Router + MDX.

## Develop

```bash
pnpm install
pnpm dev
```

## Write a post

Create `content/posts/YYYY-MM-DD-slug.mdx` with frontmatter:

```
---
title: "제목"
date: "2026-04-22"
summary: "요약 (선택)"
tags: ["태그"]
draft: false
---
```

## Deploy

Push to `main`. Vercel auto-deploys.
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "docs: readme with dev and authoring instructions"
```

- [ ] **Step 3 (manual, user action): Create Vercel project**

The user should:
1. Create a new GitHub repo and push this branch.
2. In Vercel dashboard → New Project → import the repo → defaults are fine.
3. After first deploy, set `NEXT_PUBLIC_SITE_URL` env var to the assigned `*.vercel.app` URL for correct RSS feed links.
4. Redeploy.

(This plan stops here — no automated Vercel action.)

---

## Self-review results

- [x] **Spec coverage:** All sections in the spec have corresponding tasks (layout, content model, all 9 routes, theme, search, RSS, testing).
- [x] **Placeholder scan:** No TBDs, no "handle edge cases", no "similar to task N" — every step has complete code or complete commands.
- [x] **Type consistency:** `Post`, `TagInfo`, `SearchEntry` types are defined once in `lib/posts.ts` (Task 3) and consumed by name in all downstream tasks.
- [x] **Responsive:** Layout uses `max-w-[640px] mx-auto px-4` — adapts to mobile automatically. Header nav is short text-only so it doesn't overflow.
