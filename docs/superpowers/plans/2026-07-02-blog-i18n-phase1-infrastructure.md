# Blog i18n Phase 1 — Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bilingual (ko root / `/en` prefix) infrastructure to the blog: locale-aware content pipeline, two root layouts via route groups, localized UI chrome, language switcher with cookie, home-only Accept-Language redirect, and per-locale SEO/feed/llms.

**Architecture:** Two root layouts (`app/(ko)`, `app/(en)`) whose route files are thin delegators; all logic lives once in shared modules (`components/pages/*`, `components/layout/SiteShell`, `lib/i18n.ts`, `lib/metadata.ts`, `lib/feed.ts`, `lib/llms.ts`, `lib/og-image.tsx`). `lib/posts.ts` gains a `locale` parameter reading `content/posts` (ko) or `content/en/posts` (en). A root `proxy.ts` (matcher `'/'` only) redirects English-preferring first-time visitors to `/en`; a `locale` cookie set by the switcher always wins.

**Tech Stack:** Next.js 16.2 (App Router, route groups, multiple root layouts, `proxy.ts`), React 19.2, Tailwind v4, Vitest 4, pnpm.

**Spec:** `docs/superpowers/specs/2026-07-02-blog-i18n-design.md`

## Global Constraints

- All git commits, PR titles/bodies, and code comments in **English**.
- Do **not** commit anything under `docs/superpowers/` (specs/plans stay untracked).
- No explanatory comments in code; match the sparse comment density of surrounding files.
- Korean URLs must not change: `/`, `/<slug>`, `/about`, `/feed.xml`, `/llms.txt` stay as-is.
- English URLs: `/en`, `/en/<slug>`, `/en/about`, `/en/feed.xml`, `/en/llms.txt`.
- No cross-locale fallback: a post missing in a locale is absent from that locale's list/feed/sitemap and 404s on direct access.
- DRY hard rule: every file under `app/(ko)`/`app/(en)` is a delegator of a few lines (bind `locale`, re-export). Never fork a component per locale.
- Next 16: dynamic `params` is a Promise — always `await params`. Verify unfamiliar conventions against `node_modules/next/dist/docs/` before deviating.
- Package manager: `pnpm`. Tests: `pnpm vitest run <file>`. Full: `pnpm test`, `pnpm lint`, `pnpm build`.
- Work on branch `feat/i18n-infrastructure` off `main`.

---

## File Structure (end state of Phase 1)

```
proxy.ts                                    NEW  home-only locale redirect
lib/i18n.ts                                 NEW  Locale, localePath, switchLocalePath, ui dict
lib/i18n.test.ts                            NEW
lib/accept-language.ts                      NEW  prefersEnglish()
lib/accept-language.test.ts                 NEW
lib/posts.ts                                MOD  locale param on all readers, hasPost, formatDate(date, locale)
lib/posts.test.ts                           MOD  en-locale cases
lib/metadata.ts                             NEW  buildSiteMetadata, buildPostMetadata, siteJsonLd, SITE_URL
lib/feed.ts                                 NEW  buildFeed(locale)
lib/llms.ts                                 NEW  buildLlmsTxt(locale)
lib/og-image.tsx                            NEW  renderSiteOgImage(locale), renderPostOgImage(locale, slug)
lib/nav.ts                                  MOD  navItems(locale)
components/layout/SiteShell.tsx             NEW  html/body + chrome (from app/layout.tsx)
components/pages/PostList.tsx               NEW  (from app/page.tsx)
components/pages/PostView.tsx               NEW  (from app/[slug]/page.tsx) + postStaticParams/postMetadata
components/pages/AboutPage.tsx              NEW  (from app/about/page.tsx) + aboutMetadata
components/PageTransition.tsx               NEW  (from app/template.tsx)
components/NotFoundView.tsx                 NEW  (from app/not-found.tsx)
components/LocaleSwitcher.tsx               NEW  KO/EN toggle, sets cookie
components/Header.tsx                       MOD  locale prop, LocaleSwitcher
components/Footer.tsx                       MOD  locale prop
components/NavLinks.tsx                     MOD  locale prop
components/MobileMenu.tsx                   MOD  locale prop
components/SearchModal.tsx                  MOD  locale prop (strings + result hrefs)
components/Toc.tsx                          MOD  locale prop
components/ShareButton.tsx                  MOD  locale prop
components/SpeechPlayer.tsx                 MOD  locale prop
components/ArticleActions.tsx               MOD  pass-through locale
components/Comments.tsx                     MOD  locale prop → giscus lang
app/(ko)/layout.tsx                         NEW  delegator (was app/layout.tsx — DELETE)
app/(ko)/page.tsx                           NEW  delegator (was app/page.tsx — DELETE)
app/(ko)/[slug]/page.tsx                    NEW  delegator (was app/[slug]/page.tsx — DELETE)
app/(ko)/[slug]/opengraph-image.tsx         NEW  delegator (was app/[slug]/opengraph-image.tsx — DELETE)
app/(ko)/about/page.tsx                     NEW  delegator (was app/about/page.tsx — DELETE)
app/(ko)/template.tsx                       NEW  delegator (was app/template.tsx — DELETE)
app/(ko)/not-found.tsx                      NEW  delegator (was app/not-found.tsx — DELETE)
app/(en)/layout.tsx                         NEW  delegator
app/(en)/template.tsx                       NEW  delegator
app/(en)/not-found.tsx                      NEW  delegator
app/(en)/en/page.tsx                        NEW  delegator
app/(en)/en/[slug]/page.tsx                 NEW  delegator
app/(en)/en/[slug]/opengraph-image.tsx      NEW  delegator
app/(en)/en/about/page.tsx                  NEW  delegator
app/(en)/en/opengraph-image.tsx             NEW  delegator (en site OG)
app/(en)/en/feed.xml/route.ts               NEW  delegator
app/(en)/en/llms.txt/route.ts               NEW  delegator
app/feed.xml/route.ts                       MOD  delegate to buildFeed('ko')
app/llms.txt/route.ts                       MOD  delegate to buildLlmsTxt('ko')
app/opengraph-image.tsx                     MOD  delegate to renderSiteOgImage('ko')
app/sitemap.ts                              MOD  both locales + hreflang alternates
app/global-not-found.tsx                    NEW  app-wide 404 (multiple root layouts)
next.config.ts                              MOD  experimental.globalNotFound (only if required)
content/en/about.mdx                        NEW  English about
content/en/posts/                           NEW  empty dir (posts arrive in Phase 2)
```

Unchanged: `app/robots.ts`, `app/manifest.ts`, `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `app/globals.css`, `app/fonts.ts`, `lib/mdx.ts`, `components/CodeBlock.tsx`, `components/PostImage.tsx`, `components/ReadingProgress.tsx`, `components/SearchTrigger.tsx`.

---

### Task 0: Branch setup

**Files:** none

- [ ] **Step 1: Create branch**

```bash
git checkout -b feat/i18n-infrastructure
```

---

### Task 1: `lib/i18n.ts` — locale model, paths, UI dictionary

**Files:**
- Create: `lib/i18n.ts`
- Test: `lib/i18n.test.ts`

**Interfaces:**
- Produces: `type Locale = 'ko' | 'en'`; `locales: readonly Locale[]`; `defaultLocale: Locale`;
  `otherLocale(locale: Locale): Locale`;
  `localePath(locale: Locale, path?: string): string`;
  `switchLocalePath(pathname: string, to: Locale, availableSlugs: readonly string[]): string`;
  `ui: Record<Locale, UiDict>` (shape below). All later tasks consume these.

- [ ] **Step 1: Write the failing test**

Create `lib/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { localePath, switchLocalePath, otherLocale, ui } from './i18n';

describe('localePath', () => {
  it('keeps ko at root', () => {
    expect(localePath('ko')).toBe('/');
    expect(localePath('ko', '/')).toBe('/');
    expect(localePath('ko', '/my-post')).toBe('/my-post');
    expect(localePath('ko', '/about')).toBe('/about');
  });

  it('prefixes en with /en', () => {
    expect(localePath('en')).toBe('/en');
    expect(localePath('en', '/')).toBe('/en');
    expect(localePath('en', '/my-post')).toBe('/en/my-post');
    expect(localePath('en', '/about')).toBe('/en/about');
  });
});

describe('otherLocale', () => {
  it('flips locales', () => {
    expect(otherLocale('ko')).toBe('en');
    expect(otherLocale('en')).toBe('ko');
  });
});

describe('switchLocalePath', () => {
  it('maps home to home', () => {
    expect(switchLocalePath('/', 'en', [])).toBe('/en');
    expect(switchLocalePath('/en', 'ko', [])).toBe('/');
  });

  it('maps about to about', () => {
    expect(switchLocalePath('/about', 'en', [])).toBe('/en/about');
    expect(switchLocalePath('/en/about', 'ko', [])).toBe('/about');
  });

  it('maps a post when counterpart exists', () => {
    expect(switchLocalePath('/what-is-rag', 'en', ['what-is-rag'])).toBe('/en/what-is-rag');
    expect(switchLocalePath('/en/what-is-rag', 'ko', ['what-is-rag'])).toBe('/what-is-rag');
  });

  it('falls back to home when counterpart is missing', () => {
    expect(switchLocalePath('/ko-only-post', 'en', [])).toBe('/en');
    expect(switchLocalePath('/en/en-only-post', 'ko', [])).toBe('/');
  });
});

describe('ui dictionary', () => {
  it('has identical key sets for both locales', () => {
    expect(Object.keys(ui.en).sort()).toEqual(Object.keys(ui.ko).sort());
  });

  it('formats reading time per locale', () => {
    expect(ui.ko.minRead(7)).toBe('7분');
    expect(ui.en.minRead(7)).toBe('7 min read');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/i18n.test.ts`
Expected: FAIL — `Cannot find module './i18n'` (or similar).

- [ ] **Step 3: Write the implementation**

Create `lib/i18n.ts`:

```ts
export type Locale = 'ko' | 'en';

export const locales = ['ko', 'en'] as const satisfies readonly Locale[];
export const defaultLocale: Locale = 'ko';

export function otherLocale(locale: Locale): Locale {
  return locale === 'ko' ? 'en' : 'ko';
}

export function localePath(locale: Locale, path: string = '/'): string {
  if (locale === 'ko') return path;
  return path === '/' ? '/en' : `/en${path}`;
}

export function switchLocalePath(
  pathname: string,
  to: Locale,
  availableSlugs: readonly string[],
): string {
  const bare = pathname === '/en' ? '/' : pathname.replace(/^\/en\//, '/');
  if (bare === '/' || bare === '/about') return localePath(to, bare);
  const slug = bare.replace(/^\//, '');
  return availableSlugs.includes(slug) ? localePath(to, bare) : localePath(to);
}

type UiDict = {
  siteDescription: string;
  ogLocale: string;
  bcp47: string;
  jobTitle: string;
  skipLink: string;
  noPosts: string;
  minRead: (minutes: number) => string;
  backToPosts: string;
  pageNavAria: string;
  adjacentAria: string;
  prevPost: string;
  nextPost: string;
  tagsAria: string;
  commentsAria: string;
  toc: string;
  share: string;
  copied: string;
  linkCopiedAria: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchMove: string;
  searchOpen: string;
  searchClose: string;
  listen: string;
  pause: string;
  resume: string;
  listenPostAria: string;
  audioNotReady: string;
  playerAria: string;
  jumpToCurrent: string;
  jumpToCurrentAria: string;
  back15: string;
  forward15: string;
  rateAria: (rate: number) => string;
  notFoundTitle: string;
  notFoundDesc: string;
  notFoundBack: string;
  aboutLlmsLine: string;
  switchToOther: string;
};

export const ui: Record<Locale, UiDict> = {
  ko: {
    siteDescription: '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
    ogLocale: 'ko_KR',
    bcp47: 'ko-KR',
    jobTitle: '소프트웨어 개발자',
    skipLink: '본문으로 건너뛰기',
    noPosts: '글이 아직 없습니다.',
    minRead: (minutes) => `${minutes}분`,
    backToPosts: '← Posts',
    pageNavAria: '페이지 이동',
    adjacentAria: '이전·다음 글',
    prevPost: '← 이전 글',
    nextPost: '다음 글 →',
    tagsAria: '태그',
    commentsAria: '댓글',
    toc: '목차',
    share: '공유',
    copied: '복사됨',
    linkCopiedAria: '링크 복사됨',
    searchPlaceholder: '검색어를 입력하세요',
    searchNoResults: '결과 없음',
    searchMove: '이동',
    searchOpen: '열기',
    searchClose: '닫기',
    listen: '듣기',
    pause: '일시정지',
    resume: '이어 듣기',
    listenPostAria: '글 듣기',
    audioNotReady: '이 글은 아직 음성이 준비되지 않았어요',
    playerAria: '음성 재생 컨트롤',
    jumpToCurrent: '읽는 곳으로',
    jumpToCurrentAria: '현재 읽는 위치로 이동',
    back15: '15초 뒤로',
    forward15: '15초 앞으로',
    rateAria: (rate) => `${rate}x 재생 속도`,
    notFoundTitle: '페이지를 찾을 수 없습니다.',
    notFoundDesc: '요청하신 주소가 이동되었거나 존재하지 않아요.',
    notFoundBack: '홈으로 돌아가기 →',
    aboutLlmsLine: 'seojuny 소개와 GitHub·LinkedIn 링크',
    switchToOther: 'English version',
  },
  en: {
    siteDescription: 'Notes from a software developer — on work, learning, and AI.',
    ogLocale: 'en_US',
    bcp47: 'en-US',
    jobTitle: 'Software Developer',
    skipLink: 'Skip to content',
    noPosts: 'No posts yet.',
    minRead: (minutes) => `${minutes} min read`,
    backToPosts: '← Posts',
    pageNavAria: 'Page navigation',
    adjacentAria: 'Previous and next posts',
    prevPost: '← Previous',
    nextPost: 'Next →',
    tagsAria: 'Tags',
    commentsAria: 'Comments',
    toc: 'Contents',
    share: 'Share',
    copied: 'Copied',
    linkCopiedAria: 'Link copied',
    searchPlaceholder: 'Type to search',
    searchNoResults: 'No results',
    searchMove: 'Navigate',
    searchOpen: 'Open',
    searchClose: 'Close',
    listen: 'Listen',
    pause: 'Pause',
    resume: 'Resume',
    listenPostAria: 'Listen to this post',
    audioNotReady: 'Audio for this post is not ready yet',
    playerAria: 'Audio player controls',
    jumpToCurrent: 'Now reading',
    jumpToCurrentAria: 'Jump to the sentence being read',
    back15: 'Back 15 seconds',
    forward15: 'Forward 15 seconds',
    rateAria: (rate) => `${rate}x playback speed`,
    notFoundTitle: 'Page not found.',
    notFoundDesc: 'The address you requested has moved or does not exist.',
    notFoundBack: 'Back to home →',
    aboutLlmsLine: 'About seojuny with GitHub and LinkedIn links',
    switchToOther: '한국어 버전',
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/i18n.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add lib/i18n.ts lib/i18n.test.ts
git commit -m "feat(i18n): add locale model, path helpers, and UI dictionary"
```

---

### Task 2: `lib/accept-language.ts` — browser language preference

**Files:**
- Create: `lib/accept-language.ts`
- Test: `lib/accept-language.test.ts`

**Interfaces:**
- Produces: `prefersEnglish(header: string): boolean` — true iff the best English q-value strictly beats the best Korean q-value. Consumed by `proxy.ts` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `lib/accept-language.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { prefersEnglish } from './accept-language';

describe('prefersEnglish', () => {
  it('true for English-first browsers', () => {
    expect(prefersEnglish('en-US,en;q=0.9')).toBe(true);
    expect(prefersEnglish('en')).toBe(true);
    expect(prefersEnglish('en-GB,en;q=0.9,fr;q=0.8')).toBe(true);
  });

  it('false for Korean-first browsers', () => {
    expect(prefersEnglish('ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7')).toBe(false);
    expect(prefersEnglish('ko')).toBe(false);
  });

  it('respects q-value ordering over listing order', () => {
    expect(prefersEnglish('en;q=0.5,ko;q=0.9')).toBe(false);
    expect(prefersEnglish('ko;q=0.5,en;q=0.9')).toBe(true);
  });

  it('false for empty, wildcard, or unrelated headers', () => {
    expect(prefersEnglish('')).toBe(false);
    expect(prefersEnglish('*')).toBe(false);
    expect(prefersEnglish('ja-JP,ja;q=0.9')).toBe(false);
  });

  it('ignores malformed q-values', () => {
    expect(prefersEnglish('en;q=banana,ko;q=0.9')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/accept-language.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `lib/accept-language.ts`:

```ts
export function prefersEnglish(header: string): boolean {
  let en = 0;
  let ko = 0;
  for (const part of header.split(',')) {
    const [tagRaw, ...params] = part.trim().split(';');
    const tag = tagRaw.trim().toLowerCase();
    let q = 1;
    for (const param of params) {
      const match = param.trim().match(/^q=(\d(?:\.\d+)?)$/);
      if (match) q = Number.parseFloat(match[1]);
    }
    if (tag === 'en' || tag.startsWith('en-')) en = Math.max(en, q);
    else if (tag === 'ko' || tag.startsWith('ko-')) ko = Math.max(ko, q);
  }
  return en > ko;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/accept-language.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/accept-language.ts lib/accept-language.test.ts
git commit -m "feat(i18n): add Accept-Language preference parser"
```

---

### Task 3: `lib/posts.ts` — locale-parameterized content pipeline

**Files:**
- Modify: `lib/posts.ts`
- Test: `lib/posts.test.ts`
- Create: `content/en/posts/.gitkeep`

**Interfaces:**
- Consumes: `Locale`, `defaultLocale` from `lib/i18n.ts` (Task 1).
- Produces (all existing signatures gain a trailing optional `locale: Locale = 'ko'`):
  `getAllPosts(locale?)`, `getPostBySlug(slug, locale?)`, `getAdjacentPosts(slug, locale?)`,
  `getSearchIndex(locale?)`, plus new `hasPost(slug: string, locale: Locale): boolean`,
  and `formatDate(isoDate: string, locale?: Locale): string`.

- [ ] **Step 1: Add failing tests**

In `lib/posts.test.ts`, add an English fixture in `beforeAll` (after the existing three ko files):

```ts
const POSTS_EN_TMP = path.join(TMP, 'content', 'en', 'posts');
```

(top-level, next to `POSTS_TMP`), and inside `beforeAll`:

```ts
  fs.mkdirSync(POSTS_EN_TMP, { recursive: true });
  fs.writeFileSync(
    path.join(POSTS_EN_TMP, '2026-04-10-first.mdx'),
    `---\ntitle: "First post"\ndate: "2026-04-10"\nsummary: "Hello"\ntags: ["diary"]\n---\n\nBody 1\n`,
  );
```

Append new describe blocks at the end of the file:

```ts
describe('locale', () => {
  it('defaults to ko and keeps existing behavior', () => {
    expect(posts.getAllPosts().map((p) => p.slug)).toEqual(['second', 'first']);
  });

  it('reads content/en/posts for en', () => {
    expect(posts.getAllPosts('en').map((p) => p.slug)).toEqual(['first']);
    expect(posts.getPostBySlug('first', 'en').title).toBe('First post');
  });

  it('does not fall back across locales', () => {
    expect(() => posts.getPostBySlug('second', 'en')).toThrow();
    expect(posts.getSearchIndex('en')).toHaveLength(1);
  });

  it('hasPost reports per-locale existence', () => {
    expect(posts.hasPost('first', 'ko')).toBe(true);
    expect(posts.hasPost('first', 'en')).toBe(true);
    expect(posts.hasPost('second', 'en')).toBe(false);
    expect(posts.hasPost('draft', 'ko')).toBe(false);
  });
});

describe('formatDate locale', () => {
  it('formats ko by default', () => {
    expect(posts.formatDate('2026-04-10')).toBe('2026년 4월 10일');
  });

  it('formats en as Month D, YYYY', () => {
    expect(posts.formatDate('2026-04-10', 'en')).toBe('April 10, 2026');
  });
});
```

- [ ] **Step 2: Run tests to verify new ones fail**

Run: `pnpm vitest run lib/posts.test.ts`
Expected: FAIL on the new blocks (`getAllPosts('en')` reads ko dir / `hasPost` undefined); existing tests still PASS.

- [ ] **Step 3: Implement locale support**

In `lib/posts.ts`:

Add import at top:

```ts
import { defaultLocale, type Locale } from '@/lib/i18n';
```

Replace `DATE_FORMATTER`/`formatDate` with:

```ts
const DATE_FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  ko: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
};

export function formatDate(isoDate: string, locale: Locale = defaultLocale): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return DATE_FORMATTERS[locale].format(d);
}
```

Replace `postsDir` with:

```ts
function postsDir(locale: Locale): string {
  return locale === 'ko'
    ? path.join(process.cwd(), 'content', 'posts')
    : path.join(process.cwd(), 'content', locale, 'posts');
}
```

Thread `locale` through the readers (same bodies otherwise):

```ts
function readAllRaw(locale: Locale): RawPost[] {
  const dir = postsDir(locale);
  // ...unchanged body...
}

export function getAllPosts(locale: Locale = defaultLocale): Post[] {
  return readAllRaw(locale)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ draft: _draft, ...post }) => post);
}

export function getPostBySlug(slug: string, locale: Locale = defaultLocale): Post {
  const post = getAllPosts(locale).find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug} (${locale})`);
  return post;
}

export function hasPost(slug: string, locale: Locale): boolean {
  return getAllPosts(locale).some((p) => p.slug === slug);
}

export function getAdjacentPosts(
  slug: string,
  locale: Locale = defaultLocale,
): { prev?: Post; next?: Post } {
  const posts = getAllPosts(locale);
  // ...unchanged body...
}

export function getSearchIndex(locale: Locale = defaultLocale): SearchEntry[] {
  return getAllPosts(locale).map(({ slug, title, summary, tags }) => ({
    slug,
    title,
    summary,
    tags,
  }));
}
```

Create the real content dir so builds see it:

```bash
mkdir -p content/en/posts && touch content/en/posts/.gitkeep
```

- [ ] **Step 4: Run tests to verify all pass**

Run: `pnpm vitest run lib/posts.test.ts`
Expected: PASS (old + new).

- [ ] **Step 5: Commit**

```bash
git add lib/posts.ts lib/posts.test.ts content/en/posts/.gitkeep
git commit -m "feat(i18n): parameterize content pipeline by locale"
```

---

### Task 4: Shared page/layout modules + `(ko)` route group restructure

Korean URLs and rendered HTML must be byte-for-byte equivalent after this task (only internal file layout changes). No English routes yet.

**Files:**
- Create: `lib/metadata.ts`, `components/layout/SiteShell.tsx`, `components/pages/PostList.tsx`, `components/pages/PostView.tsx`, `components/pages/AboutPage.tsx`, `components/PageTransition.tsx`, `components/NotFoundView.tsx`, `lib/og-image.tsx`
- Create: `app/(ko)/layout.tsx`, `app/(ko)/page.tsx`, `app/(ko)/[slug]/page.tsx`, `app/(ko)/[slug]/opengraph-image.tsx`, `app/(ko)/about/page.tsx`, `app/(ko)/template.tsx`, `app/(ko)/not-found.tsx`
- Delete: `app/layout.tsx`, `app/page.tsx`, `app/[slug]/page.tsx`, `app/[slug]/opengraph-image.tsx`, `app/about/page.tsx`, `app/template.tsx`, `app/not-found.tsx`
- Modify: `app/opengraph-image.tsx` (delegate to `lib/og-image.tsx`)

**Interfaces:**
- Consumes: Task 1 (`Locale`, `ui`, `localePath`, `otherLocale`), Task 3 (`getAllPosts(locale)`, `getSearchIndex(locale)`, `hasPost`, `formatDate(date, locale)`).
- Produces:
  - `lib/metadata.ts`: `SITE_URL: string`; `buildSiteMetadata(locale: Locale): Metadata`; `buildPostMetadata(slug: string, locale: Locale): Metadata`; `buildSiteJsonLd(locale: Locale): object[]`; `buildPostJsonLd(post: Post, locale: Locale): object`.
  - `components/layout/SiteShell.tsx`: `SiteShell({ locale, children })` — renders `<html lang>`, chrome, search modal.
  - `components/pages/PostList.tsx`: `PostList({ locale })`.
  - `components/pages/PostView.tsx`: `PostView({ locale, slug })` (calls `notFound()` on missing), `postStaticParams(locale): { slug: string }[]`.
  - `components/pages/AboutPage.tsx`: `AboutView({ locale })`, `aboutMetadata(locale): Metadata`.
  - `components/PageTransition.tsx` / `components/NotFoundView.tsx`: default-style shared views.
  - `lib/og-image.tsx`: `renderSiteOgImage(locale): Promise<ImageResponse>`, `renderPostOgImage(locale, slug): Promise<ImageResponse>`, `ogSize`, `ogContentType`.

- [ ] **Step 1: Create `lib/metadata.ts`**

Move `SITE_URL`, the metadata object, and `siteJsonLd` out of `app/layout.tsx`, parameterized. Content mirrors the current `app/layout.tsx:10-70` and `app/[slug]/page.tsx:34-115` values exactly, with locale substitutions:

```ts
import type { Metadata } from 'next';
import type { Post } from '@/lib/posts';
import { hasPost } from '@/lib/posts';
import { localePath, otherLocale, ui, type Locale } from '@/lib/i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

function languageAlternates(path: string, slug?: string) {
  const entries: Record<string, string> = {};
  if (!slug || hasPost(slug, 'ko')) entries.ko = localePath('ko', path);
  if (!slug || hasPost(slug, 'en')) entries.en = localePath('en', path);
  if (entries.ko) entries['x-default'] = entries.ko;
  return entries;
}

export function buildSiteMetadata(locale: Locale): Metadata {
  const t = ui[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'seojuny.dev', template: '%s — seojuny.dev' },
    description: t.siteDescription,
    alternates: {
      canonical: localePath(locale),
      languages: languageAlternates('/'),
      types: { 'application/atom+xml': localePath(locale, '/feed.xml') },
    },
    openGraph: {
      type: 'website',
      siteName: 'seojuny.dev',
      locale: t.ogLocale,
      url: localePath(locale),
      title: 'seojuny.dev',
      description: t.siteDescription,
    },
    twitter: { card: 'summary_large_image', title: 'seojuny.dev', description: t.siteDescription },
    ...(locale === 'ko'
      ? {
          verification: {
            other: { 'naver-site-verification': '517ef8cf614d57620560dff23bd5fa37dcab4ba7' },
          },
        }
      : {}),
  };
}

export function buildPostMetadata(post: Post, locale: Locale): Metadata {
  const path = `/${post.slug}`;
  const url = localePath(locale, path);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url, languages: languageAlternates(path, post.slug) },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.summary,
      siteName: 'seojuny.dev',
      locale: ui[locale].ogLocale,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  };
}

export function buildSiteJsonLd(locale: Locale): object[] {
  const t = ui[locale];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: `${SITE_URL}${localePath(locale)}`,
      name: 'seojuny.dev',
      description: t.siteDescription,
      inLanguage: t.bcp47,
      author: { '@type': 'Person', name: 'seojuny', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'seojuny',
      url: SITE_URL,
      jobTitle: t.jobTitle,
      sameAs: ['https://github.com/seojuny95', 'https://www.linkedin.com/in/seoj95/'],
    },
  ];
}

export function buildPostJsonLd(post: Post, locale: Locale): object {
  const url = `${SITE_URL}${localePath(locale, `/${post.slug}`)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: ui[locale].bcp47,
    keywords: post.tags,
    mainEntityOfPage: url,
    url,
    image: `${url}/opengraph-image`,
    author: {
      '@type': 'Person',
      name: 'seojuny',
      url: `${SITE_URL}${localePath(locale, '/about')}`,
      sameAs: ['https://github.com/seojuny95', 'https://www.linkedin.com/in/seoj95/'],
    },
    publisher: { '@type': 'Person', name: 'seojuny', url: SITE_URL },
  };
}
```

Note: `otherLocale` import is used in later tasks' modules; drop it here if unused (lint will tell you).

- [ ] **Step 2: Create `components/layout/SiteShell.tsx`**

Body of current `app/layout.tsx:72-95` with locale threading. Chrome components receive `locale` (their props are added in Task 5 — until then TypeScript errors on these props are expected; `pnpm build` must be fully green at the end of Task 5. Run the build after this task anyway to catch structural errors early; prop-type errors from not-yet-modified components are the only acceptable failures.)

```tsx
import { Analytics } from '@vercel/analytics/next';
import '@/app/globals.css';
import { pretendard } from '@/app/fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchModal } from '@/components/SearchModal';
import { getAllPosts, getSearchIndex } from '@/lib/posts';
import { otherLocale, ui, type Locale } from '@/lib/i18n';
import { buildSiteJsonLd } from '@/lib/metadata';

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const searchIndex = getSearchIndex(locale);
  const otherSlugs = getAllPosts(otherLocale(locale)).map((p) => p.slug);
  return (
    <html lang={locale} className={pretendard.variable}>
      <body>
        <script type="application/ld+json">
          {JSON.stringify(buildSiteJsonLd(locale))}
        </script>
        <a href="#main" className="skip-link">{ui[locale].skipLink}</a>
        <div className="min-h-screen flex flex-col">
          <Header locale={locale} otherSlugs={otherSlugs} />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-[680px] px-4 sm:px-5 flex-1 pt-10 sm:pt-14 outline-none"
          >
            {children}
          </main>
          <Footer locale={locale} />
        </div>
        <SearchModal index={searchIndex} locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create `components/pages/PostList.tsx`**

Move the body of `app/page.tsx` verbatim, then localize the two strings and links:

- signature: `export function PostList({ locale }: { locale: Locale })`
- `getAllPosts(locale)`, empty state `ui[locale].noPosts`
- `<Link href={localePath(locale, `/${p.slug}`)}>`
- `<time>` line: `{formatDate(p.date, locale)}` and `<span>{ui[locale].minRead(p.readingTime)}</span>`
- imports: `import { getAllPosts, formatDate } from '@/lib/posts'; import { localePath, ui, type Locale } from '@/lib/i18n';`

- [ ] **Step 4: Create `components/pages/PostView.tsx`**

Move the body of `app/[slug]/page.tsx` (component + `generateStaticParams` logic; metadata moved to `lib/metadata.ts` in Step 1):

```tsx
import fs from 'node:fs';
import path from 'node:path';
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts, formatDate } from '@/lib/posts';
import { mdxOptions } from '@/lib/mdx';
import { localePath, ui, type Locale } from '@/lib/i18n';
import { buildPostJsonLd } from '@/lib/metadata';
import { ArticleActions } from '@/components/ArticleActions';
import { CodeBlock } from '@/components/CodeBlock';
import { Comments } from '@/components/Comments';
import { PostImage } from '@/components/PostImage';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Toc } from '@/components/Toc';

const mdxComponents = {
  img: PostImage,
  pre: CodeBlock,
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
} as MDXRemoteProps['components'];

export function postStaticParams(locale: Locale) {
  return getAllPosts(locale).map((p) => ({ slug: p.slug }));
}

export function PostView({ locale, slug }: { locale: Locale; slug: string }) {
  const t = ui[locale];
  let post;
  try {
    post = getPostBySlug(slug, locale);
  } catch {
    notFound();
  }
  const { prev, next } = getAdjacentPosts(slug, locale);

  const audioRel =
    locale === 'ko' ? `posts/${slug}/audio.mp3` : `posts/${slug}/${locale}/audio.mp3`;
  const hasAudio = fs.existsSync(path.join(process.cwd(), 'public', audioRel));
  const audioSrc = hasAudio ? `/${audioRel}` : undefined;
  const timingSrc = hasAudio ? `/${audioRel.replace(/\.mp3$/, '.json')}` : undefined;

  return (
    <article>
      <script type="application/ld+json">
        {JSON.stringify(buildPostJsonLd(post, locale))}
      </script>
      <ReadingProgress />
      <Toc locale={locale} />
      <nav aria-label={t.pageNavAria}>
        <Link
          href={localePath(locale)}
          className="inline-block text-[14px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
        >
          {t.backToPosts}
        </Link>
      </nav>
      {/* header block unchanged except: formatDate(post.date, locale),
          {t.minRead(post.readingTime)}, aria-label={t.tagsAria} */}
      <ArticleActions audioSrc={audioSrc} timingSrc={timingSrc} locale={locale} />
      <div className="prose-blog">
        <MDXRemote source={post.content} components={mdxComponents} options={mdxOptions} />
      </div>
      <hr className="mt-16 mb-8 sm:mt-20 sm:mb-10" />
      <nav aria-label={t.adjacentAria} className="text-[14px] flex flex-col gap-6 sm:flex-row sm:justify-between">
        {/* prev/next blocks unchanged except href={localePath(locale, `/${next.slug}`)} and
            labels {t.prevPost} / {t.nextPost} */}
      </nav>
      <section className="mt-16 sm:mt-20" aria-label={t.commentsAria}>
        <Comments locale={locale} />
      </section>
    </article>
  );
}
```

(The `{/* ... unchanged ... */}` blocks are copied verbatim from `app/[slug]/page.tsx:131-198` with only the listed substitutions.)

- [ ] **Step 5: Create `components/pages/AboutPage.tsx`**

From `app/about/page.tsx`, parameterized:

```tsx
export function aboutMetadata(locale: Locale) {
  return { title: 'About — seojuny.dev', alternates: { canonical: localePath(locale, '/about'), languages: { ko: '/about', en: '/en/about', 'x-default': '/about' } } };
}

export function AboutView({ locale }: { locale: Locale }) {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content', ...(locale === 'ko' ? ['about.mdx'] : [locale, 'about.mdx'])),
    'utf8',
  );
  // rest verbatim from app/about/page.tsx
}
```

- [ ] **Step 6: Create `components/PageTransition.tsx` and `components/NotFoundView.tsx`**

```tsx
// components/PageTransition.tsx
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
```

`components/NotFoundView.tsx` — body of `app/not-found.tsx` with `{ locale }` prop; strings from `ui[locale]` (`notFoundTitle`, `notFoundDesc`, `notFoundBack`), home link `href={localePath(locale)}`.

- [ ] **Step 7: Create `lib/og-image.tsx`**

Merge `app/opengraph-image.tsx` and `app/[slug]/opengraph-image.tsx` render bodies:

```tsx
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

export async function renderSiteOgImage(locale: Locale): Promise<ImageResponse>
// verbatim from app/opengraph-image.tsx; subtitle:
//   ko '소프트웨어 개발과 AI 학습 기록' / en 'Notes on software development and AI learning'
//   (add these as a local const map in this file, not the ui dict — OG-only copy)

export async function renderPostOgImage(locale: Locale, slug: string): Promise<ImageResponse>
// verbatim from app/[slug]/opengraph-image.tsx with:
//   getPostBySlug(slug, locale), formatDate(post.date, locale), ui[locale].minRead(post.readingTime)
```

- [ ] **Step 8: Create `(ko)` delegators, delete originals**

```tsx
// app/(ko)/layout.tsx
import { SiteShell } from '@/components/layout/SiteShell';
import { buildSiteMetadata } from '@/lib/metadata';

export const metadata = buildSiteMetadata('ko');

export default function KoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ko">{children}</SiteShell>;
}
```

```tsx
// app/(ko)/page.tsx
import { PostList } from '@/components/pages/PostList';

export default function Page() {
  return <PostList locale="ko" />;
}
```

```tsx
// app/(ko)/[slug]/page.tsx
import type { Metadata } from 'next';
import { PostView, postStaticParams } from '@/components/pages/PostView';
import { buildPostMetadata } from '@/lib/metadata';
import { getPostBySlug } from '@/lib/posts';

export function generateStaticParams() {
  return postStaticParams('ko');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    return buildPostMetadata(getPostBySlug(slug, 'ko'), 'ko');
  } catch {
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostView locale="ko" slug={slug} />;
}
```

```tsx
// app/(ko)/[slug]/opengraph-image.tsx
import { renderPostOgImage, ogSize, ogContentType } from '@/lib/og-image';
import { postStaticParams } from '@/components/pages/PostView';

export const alt = 'seojuny.dev';
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return postStaticParams('ko');
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return renderPostOgImage('ko', (await params).slug);
}
```

```tsx
// app/(ko)/about/page.tsx
import { AboutView, aboutMetadata } from '@/components/pages/AboutPage';

export const metadata = aboutMetadata('ko');

export default function Page() {
  return <AboutView locale="ko" />;
}
```

```tsx
// app/(ko)/template.tsx
export { default } from '@/components/PageTransition';
```

```tsx
// app/(ko)/not-found.tsx
import { NotFoundView } from '@/components/NotFoundView';

export default function NotFound() {
  return <NotFoundView locale="ko" />;
}
```

Rewrite `app/opengraph-image.tsx` as a delegator:

```tsx
import { renderSiteOgImage, ogSize, ogContentType } from '@/lib/og-image';

export const alt = 'seojuny.dev';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderSiteOgImage('ko');
}
```

Delete the moved originals:

```bash
git rm app/layout.tsx app/page.tsx app/template.tsx app/not-found.tsx \
  app/about/page.tsx 'app/[slug]/page.tsx' 'app/[slug]/opengraph-image.tsx'
```

- [ ] **Step 9: Attempt build (structural check only)**

Run: `pnpm build`
Expected at this point: type errors ONLY about `locale`/`otherSlugs` props not existing on `Header`/`Footer`/`SearchModal`/`Toc`/`Comments`/`ArticleActions` (fixed in Task 5). Any other error (route resolution, missing module, html/body) must be fixed now.

- [ ] **Step 10: Commit (structure move)**

```bash
git add -A app components lib
git commit -m "refactor(i18n): extract shared page modules and move ko routes into (ko) group"
```

---

### Task 5: Localize chrome + interactive components

**Files:**
- Modify: `lib/nav.ts`, `components/Header.tsx`, `components/Footer.tsx`, `components/NavLinks.tsx`, `components/MobileMenu.tsx`, `components/SearchModal.tsx`, `components/Toc.tsx`, `components/ShareButton.tsx`, `components/SpeechPlayer.tsx`, `components/ArticleActions.tsx`, `components/Comments.tsx`

**Interfaces:**
- Consumes: `ui`, `localePath`, `type Locale` (Task 1).
- Produces: every listed component accepts `locale: Locale` (Header additionally `otherSlugs: string[]`, forwarded to `LocaleSwitcher` in Task 6); `navItems(locale)` replaces `NAV_ITEMS`.

- [ ] **Step 1: `lib/nav.ts` → `navItems(locale)`**

```ts
import { localePath, type Locale } from '@/lib/i18n';

export function navItems(locale: Locale) {
  return [
    { href: localePath(locale), label: 'Posts', match: [localePath(locale)] },
    { href: localePath(locale, '/about'), label: 'About', match: [localePath(locale, '/about')] },
  ] as const;
}
```

Active-match note: `NavLinks`/`MobileMenu` currently test `pathname === m || pathname.startsWith(`${m}/`)`. With `match: ['/en']`, `/en/about` would match Posts too — so in both components, compute active as: exact match, or `startsWith` only when `m !== localePath(locale)`; additionally Posts is active for any post path (`pathname !== about path`). Keep it simple and explicit:

```ts
const homePath = localePath(locale);
const aboutPath = localePath(locale, '/about');
const isAbout = pathname === aboutPath || pathname.startsWith(`${aboutPath}/`);
const active = item.href === aboutPath ? isAbout : !isAbout;
```

(Home nav item is "Posts" and post detail pages should highlight Posts — this matches current behavior where `match: ['/', '/posts']` never matched `/my-slug`; improving to highlight Posts on post pages is acceptable and simpler than replicating the old subtle behavior. If preserving exact old behavior is preferred, use `active = pathname === item.href`.)

- [ ] **Step 2: Components take `locale`**

Mechanical substitutions (every Korean literal comes from `ui[locale]`):

| File | Change |
| --- | --- |
| `Header.tsx` | `({ locale, otherSlugs }: { locale: Locale; otherSlugs: string[] })`; logo `href={localePath(locale)}`; pass `locale` to `NavLinks`/`MobileMenu`. (`LocaleSwitcher` is mounted in Task 6 — accept `otherSlugs` now, unused until then.) |
| `Footer.tsx` | `({ locale })`; both `href="/"` → `localePath(locale)`; About → `localePath(locale, '/about')`; RSS → `localePath(locale, '/feed.xml')`. Labels Posts/About/RSS stay English. |
| `NavLinks.tsx` | `({ locale })`; `navItems(locale)`; active logic per Step 1. |
| `MobileMenu.tsx` | `({ locale })`; `navItems(locale)`; logo `href={localePath(locale)}`; active logic per Step 1. |
| `SearchModal.tsx` | `({ index, locale })`; placeholder + empty-state `ui[locale].searchPlaceholder`; `결과 없음` → `searchNoResults`; footer `이동/열기/닫기` → `searchMove/searchOpen/searchClose`; both `router.push(`/${slug}`)` → `router.push(localePath(locale, `/${slug}`))`. |
| `Toc.tsx` | `({ locale })`; `aria-label`/heading `목차` → `ui[locale].toc`. |
| `ShareButton.tsx` | `({ locale })`; `공유`→`share`, `복사됨`→`copied`, aria `링크 복사됨`→`linkCopiedAria`. |
| `SpeechPlayer.tsx` | `({ audioSrc, timingSrc, locale })`; literals per the table: `듣기`→`listen`, `일시정지`→`pause`, `이어 듣기`→`resume`, `글 듣기`→`listenPostAria`, disabled `title`→`audioNotReady`, region aria→`playerAria`, `읽는 곳으로`→`jumpToCurrent`, aria→`jumpToCurrentAria`, `15초 뒤로`→`back15`, `15초 앞으로`→`forward15`, rate aria→`rateAria(rate)`. |
| `ArticleActions.tsx` | add `locale: Locale` prop, forward to `SpeechPlayer` and `ShareButton`. |
| `Comments.tsx` | `({ locale })`; `lang="ko"` → `lang={locale}`. |

- [ ] **Step 3: Build to verify**

Run: `pnpm build`
Expected: PASS. All ko routes in output (`/`, `/about`, 8 post pages, `/feed.xml`, `/llms.txt`, `/sitemap.xml`).

- [ ] **Step 4: Visual sanity check (ko unchanged)**

Run: `pnpm dev` (background), then:

```bash
curl -s http://localhost:3000/ | grep -o '<html lang="ko"' && \
curl -s http://localhost:3000/what-is-rag | grep -o '분</span>' | head -1
```

Expected: both greps match (Korean UI intact).

- [ ] **Step 5: Commit**

```bash
git add lib/nav.ts components
git commit -m "feat(i18n): localize chrome and article components via ui dictionary"
```

---

### Task 6: Language switcher (cookie-setting)

**Files:**
- Create: `components/LocaleSwitcher.tsx`
- Modify: `components/Header.tsx` (mount it)

**Interfaces:**
- Consumes: `switchLocalePath`, `otherLocale`, `ui` (Task 1).
- Produces: `LocaleSwitcher({ locale, otherSlugs }: { locale: Locale; otherSlugs: string[] })` — client component; navigates to the counterpart URL and sets `locale` cookie. Cookie contract consumed by `proxy.ts` (Task 8): name `locale`, value `'ko' | 'en'`, `path=/`, `max-age=31536000`, `samesite=lax`.

- [ ] **Step 1: Create `components/LocaleSwitcher.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { otherLocale, switchLocalePath, ui, type Locale } from '@/lib/i18n';

export function LocaleSwitcher({
  locale,
  otherSlugs,
}: {
  locale: Locale;
  otherSlugs: string[];
}) {
  const pathname = usePathname();
  const target = otherLocale(locale);
  const href = switchLocalePath(pathname, target, otherSlugs);
  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={ui[locale].switchToOther}
      onClick={() => {
        document.cookie = `locale=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 uppercase tracking-wide"
    >
      {target === 'en' ? 'EN' : 'KO'}
    </Link>
  );
}
```

- [ ] **Step 2: Mount in `Header.tsx`**

Desktop: inside the existing right-side container, before `SearchTrigger`, separated by the existing border style. Mobile: in the `md:hidden` cluster next to `SearchTrigger`:

```tsx
<div className="hidden md:flex items-center gap-4 ml-auto pl-4 border-l border-[var(--rule)]">
  <LocaleSwitcher locale={locale} otherSlugs={otherSlugs} />
  <SearchTrigger />
</div>

<div className="md:hidden ml-auto flex items-center gap-3">
  <LocaleSwitcher locale={locale} otherSlugs={otherSlugs} />
  <SearchTrigger />
  <MobileMenu locale={locale} />
</div>
```

- [ ] **Step 3: Verify in dev**

`pnpm dev`; on `/` the header shows `EN`. Clicking navigates to `/en` (404 until Task 7 — that's expected; verify the cookie in devtools: `locale=en`). Navigate back to `/`, click `KO` there is none (we're on ko) — instead check `document.cookie` manually. Full E2E lands after Task 7.

- [ ] **Step 4: Commit**

```bash
git add components/LocaleSwitcher.tsx components/Header.tsx
git commit -m "feat(i18n): add KO/EN switcher with locale cookie"
```

---

### Task 7: `(en)` route group + feeds + English About

**Files:**
- Create: `app/(en)/layout.tsx`, `app/(en)/template.tsx`, `app/(en)/not-found.tsx`, `app/(en)/en/page.tsx`, `app/(en)/en/[slug]/page.tsx`, `app/(en)/en/[slug]/opengraph-image.tsx`, `app/(en)/en/about/page.tsx`, `app/(en)/en/opengraph-image.tsx`, `app/(en)/en/feed.xml/route.ts`, `app/(en)/en/llms.txt/route.ts`
- Create: `lib/feed.ts`, `lib/llms.ts`, `content/en/about.mdx`
- Modify: `app/feed.xml/route.ts`, `app/llms.txt/route.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: `buildFeed(locale: Locale): string` (Atom XML), `buildLlmsTxt(locale: Locale): string`.

- [ ] **Step 1: `lib/feed.ts`**

Move the body of `app/feed.xml/route.ts`, parameterized:

```ts
import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';
import { localePath, ui, type Locale } from '@/lib/i18n';
import { SITE_URL } from '@/lib/metadata';

export function buildFeed(locale: Locale): string {
  const base = `${SITE_URL}${localePath(locale) === '/' ? '' : localePath(locale)}`;
  const feed = new Feed({
    title: 'seojuny.dev',
    description: ui[locale].siteDescription,
    id: base || SITE_URL,
    link: base || SITE_URL,
    language: locale,
    copyright: `© ${new Date().getFullYear()} seojuny`,
    feedLinks: { atom: `${SITE_URL}${localePath(locale, '/feed.xml')}` },
  });
  for (const post of getAllPosts(locale)) {
    const url = `${SITE_URL}${localePath(locale, `/${post.slug}`)}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      date: new Date(post.date),
    });
  }
  return feed.atom1();
}
```

- [ ] **Step 2: `lib/llms.ts`**

Move the body of `app/llms.txt/route.ts`, parameterized with `getAllPosts(locale)`, `ui[locale].siteDescription`, `ui[locale].aboutLlmsLine`, URLs via `localePath`.

- [ ] **Step 3: Rewrite ko routes as delegators**

```ts
// app/feed.xml/route.ts
import { buildFeed } from '@/lib/feed';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildFeed('ko'), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
```

`app/llms.txt/route.ts` likewise with `buildLlmsTxt('ko')` and `text/plain`.

- [ ] **Step 4: Create `(en)` delegators**

Each mirrors its `(ko)` counterpart with `'en'` bound — copy the `(ko)` file and change the literal:

- `app/(en)/layout.tsx`: `metadata = buildSiteMetadata('en')`, `<SiteShell locale="en">`
- `app/(en)/template.tsx`: `export { default } from '@/components/PageTransition';`
- `app/(en)/not-found.tsx`: `<NotFoundView locale="en" />`
- `app/(en)/en/page.tsx`: `<PostList locale="en" />`
- `app/(en)/en/[slug]/page.tsx`: as `(ko)` version with `'en'` everywhere
- `app/(en)/en/[slug]/opengraph-image.tsx`: as `(ko)` version with `'en'`
- `app/(en)/en/about/page.tsx`: `aboutMetadata('en')`, `<AboutView locale="en" />`
- `app/(en)/en/opengraph-image.tsx`: same shape as root `app/opengraph-image.tsx` but `renderSiteOgImage('en')`
- `app/(en)/en/feed.xml/route.ts` / `app/(en)/en/llms.txt/route.ts`: as Step 3 with `'en'`

- [ ] **Step 5: Create `content/en/about.mdx`**

```mdx
Software developer.

I build web services with Next.js, React, and TypeScript.
These days I'm studying AI on the side.

This blog is where I write down problems I've run into at work, things I've
learned, and the occasional stray thought.

Currently on a one-run-a-day streak..
```

- [ ] **Step 6: Build and verify routes**

Run: `pnpm build`
Expected: PASS; output contains `/en`, `/en/about`, `/en/feed.xml`, `/en/llms.txt` (no `/en/<slug>` pages yet — `content/en/posts/` is empty).

Run `pnpm dev` and:

```bash
curl -s http://localhost:3000/en | grep -o '<html lang="en"' && \
curl -s http://localhost:3000/en | grep -o 'No posts yet.' && \
curl -s http://localhost:3000/en/about | grep -o 'Software developer' && \
curl -s http://localhost:3000/en/feed.xml | head -3 && \
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/en/what-is-rag
```

Expected: `lang="en"`, `No posts yet.`, about text, Atom XML, and `404` (ko-only post absent in en).

- [ ] **Step 7: Commit**

```bash
git add 'app/(en)' app/feed.xml app/llms.txt lib/feed.ts lib/llms.ts content/en/about.mdx
git commit -m "feat(i18n): add /en route group, English feeds, and About"
```

---

### Task 8: Global 404 for unmatched routes

With two root layouts there is no single root layout to host a global `not-found`; URLs matching neither group (e.g. `/foo/bar`) need `app/global-not-found.tsx` (Next 16 convention for exactly this case — see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`, "global-not-found.js").

**Files:**
- Create: `app/global-not-found.tsx`
- Modify: `next.config.ts` (only if the doc marks the flag as required — check `experimental.globalNotFound` in the not-found.md doc first)

- [ ] **Step 1: Read the doc section**

Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` lines 45–130 and follow its exact skeleton (it must render its own `<html>`/`<body>` and import global CSS/fonts itself).

- [ ] **Step 2: Create `app/global-not-found.tsx`**

Per the doc skeleton, wrapping `NotFoundView`:

```tsx
import '@/app/globals.css';
import { pretendard } from '@/app/fonts';
import { NotFoundView } from '@/components/NotFoundView';

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <main className="mx-auto w-full max-w-[680px] px-4 sm:px-5 pt-10 sm:pt-14">
          <NotFoundView locale="ko" />
        </main>
      </body>
    </html>
  );
}
```

If the installed Next version requires `experimental.globalNotFound: true` in `next.config.ts`, add it.

- [ ] **Step 3: Verify**

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/no/such/route
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/nonexistent-slug
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/en/nonexistent-slug
```

Expected: `404` on all three (first via global-not-found; latter two via each group's `not-found`).

- [ ] **Step 4: Commit**

```bash
git add app/global-not-found.tsx next.config.ts
git commit -m "feat(i18n): add global 404 for routes outside both locale groups"
```

---

### Task 9: `proxy.ts` — home-only browser-language redirect

**Files:**
- Create: `proxy.ts` (repo root, next to `next.config.ts`)

**Interfaces:**
- Consumes: `prefersEnglish` (Task 2); cookie contract from Task 6 (`locale` = `'ko' | 'en'`).

- [ ] **Step 1: Create `proxy.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { prefersEnglish } from '@/lib/accept-language';

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get('locale')?.value;
  if (cookie === 'ko') return;
  if (
    cookie === 'en' ||
    (!cookie && prefersEnglish(request.headers.get('accept-language') ?? ''))
  ) {
    return NextResponse.redirect(new URL('/en', request.url), 307);
  }
}

export const config = { matcher: '/' };
```

- [ ] **Step 2: Verify redirect matrix**

`pnpm dev`, then:

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'Accept-Language: en-US,en;q=0.9' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Accept-Language: ko-KR,ko;q=0.9,en;q=0.8' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Accept-Language: en-US' -H 'Cookie: locale=ko' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -H 'Cookie: locale=en' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code}\n' -H 'Accept-Language: en-US' http://localhost:3000/what-is-rag
```

Expected, line by line: `307 …/en` · `200` · `200` (cookie wins) · `307 …/en` · `200` (no header, no redirect) · `200` (post pages never redirect).

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(i18n): redirect English-preferring visitors from home to /en"
```

---

### Task 10: Sitemap with hreflang alternates

**Files:**
- Modify: `app/sitemap.ts`

**Interfaces:**
- Consumes: `getAllPosts(locale)`, `hasPost`, `localePath`, `SITE_URL`.

- [ ] **Step 1: Rewrite `app/sitemap.ts`**

```ts
import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { getAllPosts, hasPost } from '@/lib/posts';
import { locales, localePath } from '@/lib/i18n';
import { SITE_URL } from '@/lib/metadata';

function alternatesFor(pathname: string, has: (locale: 'ko' | 'en') => boolean) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    if (has(locale)) languages[locale] = `${SITE_URL}${localePath(locale, pathname)}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    const latest = posts[0]?.date ?? new Date().toISOString();
    const aboutFile =
      locale === 'ko'
        ? path.join(process.cwd(), 'content', 'about.mdx')
        : path.join(process.cwd(), 'content', locale, 'about.mdx');
    const aboutMtime = fs.statSync(aboutFile).mtime.toISOString();

    entries.push(
      {
        url: `${SITE_URL}${localePath(locale)}`,
        lastModified: latest,
        changeFrequency: 'weekly',
        priority: locale === 'ko' ? 1 : 0.9,
        alternates: alternatesFor('/', () => true),
      },
      {
        url: `${SITE_URL}${localePath(locale, '/about')}`,
        lastModified: aboutMtime,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: alternatesFor('/about', () => true),
      },
      ...posts.map((post) => ({
        url: `${SITE_URL}${localePath(locale, `/${post.slug}`)}`,
        lastModified: post.date,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: alternatesFor(`/${post.slug}`, (l) => hasPost(post.slug, l)),
      })),
    );
  }
  return entries;
}
```

- [ ] **Step 2: Verify**

Run: `pnpm build`, then `pnpm start` (or dev) and:

```bash
curl -s http://localhost:3000/sitemap.xml | grep -c 'xhtml:link' ; curl -s http://localhost:3000/sitemap.xml | grep -o 'seojuny.dev/en' | head -1
```

Expected: nonzero `xhtml:link` count (hreflang emitted) and `/en` URLs present.

- [ ] **Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat(i18n): emit both locales with hreflang alternates in sitemap"
```

---

### Task 11: Full verification + PR

**Files:** none (fixes only if verification fails)

- [ ] **Step 1: Full test/lint/build**

```bash
pnpm test && pnpm lint && pnpm build
```

Expected: all PASS. Fix anything that fails before proceeding.

- [ ] **Step 2: Manual matrix (dev server)**

- `/` — Korean list, `<html lang="ko">`, dates `2026년 7월 2일`, `N분`, header shows `EN`
- `/en` — English chrome, `<html lang="en">`, `No posts yet.`, header shows `KO`
- `/what-is-rag` — Korean post renders, TOC `목차`, prev/next Korean, giscus `lang=ko`
- `/en/what-is-rag` — 404
- `/about` vs `/en/about` — respective languages
- hreflang: `curl -s localhost:3000/ | grep hreflang` shows `ko`, `en`, `x-default`
- switcher: `/about` → EN → lands `/en/about`; cookie set; revisit `/` → redirected to `/en`; switch KO → `/` stays
- `/feed.xml` Korean items; `/en/feed.xml` valid Atom with zero items (until Phase 2)

- [ ] **Step 3: Push and open PR (English)**

```bash
git push -u origin feat/i18n-infrastructure
gh pr create --title "feat: bilingual (ko/en) infrastructure" --body "$(cat <<'EOF'
## Summary
- Locale model + UI dictionary (`lib/i18n.ts`), locale-parameterized content pipeline (`lib/posts.ts`)
- Two root layouts via route groups: Korean at `/`, English under `/en` (fully static; shared page modules, thin route delegators)
- Localized chrome, KO/EN switcher with locale cookie, home-only Accept-Language redirect (`proxy.ts`)
- Per-locale metadata/hreflang/sitemap/JSON-LD, `/en/feed.xml`, `/en/llms.txt`, English About
- English posts land in a follow-up (Phase 2); `/en` list is empty until then

## Test plan
- `pnpm test` (i18n, accept-language, posts locale suites)
- `pnpm build` + curl matrix: redirect (cookie/Accept-Language), 404 isolation between locales, hreflang output

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Out of scope for this plan (subsequent phases)

- Phase 2: translate 8 posts into `content/en/posts/` (natural English, image paths → `/posts/<slug>/en/...`)
- Phase 3: 123 English SVGs under `public/posts/<slug>/en/`
- Phase 4: English TTS in `scripts/generate-audio.ts`
- Phase 5: rewrite 42 Korean commit messages via `git filter-repo` + force-push
