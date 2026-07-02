import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'));
const POSTS_TMP = path.join(TMP, 'content', 'posts');
const POSTS_EN_TMP = path.join(TMP, 'content', 'en', 'posts');

beforeAll(() => {
  fs.mkdirSync(POSTS_TMP, { recursive: true });
  fs.writeFileSync(
    path.join(POSTS_TMP, '2026-04-10-first.mdx'),
    `---\ntitle: "첫 글"\ndate: "2026-04-10"\nsummary: "안녕하세요"\ntags: ["일기"]\n---\n\n본문 1\n`,
  );
  fs.writeFileSync(
    path.join(POSTS_TMP, '2026-04-15-second.mdx'),
    `---\ntitle: "두 번째 글"\ndate: "2026-04-15"\ntags: ["일기", "개발"]\n---\n\n본문 2\n`,
  );
  fs.writeFileSync(
    path.join(POSTS_TMP, '2026-04-20-draft.mdx'),
    `---\ntitle: "초안"\ndate: "2026-04-20"\ndraft: true\n---\n\n미완성\n`,
  );
  fs.mkdirSync(POSTS_EN_TMP, { recursive: true });
  fs.writeFileSync(
    path.join(POSTS_EN_TMP, '2026-04-10-first.mdx'),
    `---\ntitle: "First post"\ndate: "2026-04-10"\nsummary: "Hello"\ntags: ["diary"]\n---\n\nBody 1\n`,
  );
  vi.spyOn(process, 'cwd').mockReturnValue(TMP);
});

afterAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const posts = await import('./posts');

describe('getAllPosts', () => {
  it('returns non-draft posts sorted by date desc', () => {
    expect(posts.getAllPosts().map((p) => p.slug)).toEqual(['second', 'first']);
  });

  it('excludes drafts', () => {
    expect(posts.getAllPosts().find((p) => p.slug === 'draft')).toBeUndefined();
  });

  it('defaults tags to empty array when missing and preserves when present', () => {
    const all = posts.getAllPosts();
    expect(all.find((p) => p.slug === 'second')?.tags).toEqual(['일기', '개발']);
  });
});

describe('getPostBySlug', () => {
  it('returns matching post', () => {
    const p = posts.getPostBySlug('first');
    expect(p.title).toBe('첫 글');
    expect(p.summary).toBe('안녕하세요');
  });

  it('throws when not found', () => {
    expect(() => posts.getPostBySlug('nope')).toThrow();
  });
});

describe('getAdjacentPosts', () => {
  it('prev=newer, next=older', () => {
    const { prev, next } = posts.getAdjacentPosts('first');
    expect(prev?.slug).toBe('second');
    expect(next).toBeUndefined();
  });

  it('handles newest post', () => {
    const { prev, next } = posts.getAdjacentPosts('second');
    expect(prev).toBeUndefined();
    expect(next?.slug).toBe('first');
  });
});

describe('getSearchIndex', () => {
  it('returns entries without content', () => {
    const idx = posts.getSearchIndex();
    expect(idx).toHaveLength(2);
    expect(idx[0]).toHaveProperty('slug');
    expect(idx[0]).toHaveProperty('title');
    expect(idx[0]).not.toHaveProperty('content');
  });
});

describe('readingTime', () => {
  it('returns at least 1 minute for short content', () => {
    expect(posts.readingTime('짧은 글')).toBe(1);
  });

  it('counts Korean characters at ~500 cpm', () => {
    expect(posts.readingTime('가'.repeat(1000))).toBe(2);
  });

  it('counts Latin words at ~220 wpm', () => {
    const text = Array.from({ length: 660 }, (_, i) => `word${i}`).join(' ');
    expect(posts.readingTime(text)).toBe(3);
  });

  it('counts fenced code blocks at ~100 wpm', () => {
    // 250 lines × 4 tokens = 1000 code words → 10 minutes
    const code = '```js\n' + 'let x = 1;\n'.repeat(250) + '```';
    expect(posts.readingTime(code)).toBe(10);
  });

  it('counts inline code content as readable text', () => {
    const prose = '가'.repeat(400); // 0.8 min
    const inline = ' `alpha beta` '.repeat(110); // 220 words → 1 min
    expect(posts.readingTime(prose + inline)).toBe(2);
  });

  it('counts link display text as readable text', () => {
    const links = '[word word](https://example.com) '.repeat(220); // 440 words → 2 min
    expect(posts.readingTime(links)).toBe(2);
  });

  it('adds 12 seconds per image', () => {
    const images = '![alt](/posts/x/img.png)\n'.repeat(10); // 120s → 2 min
    expect(posts.readingTime(images)).toBe(2);
  });

  it('does not count image syntax inside code blocks as images', () => {
    const code = '```md\n' + '![alt](/img.png)\n'.repeat(10) + '```';
    expect(posts.readingTime(code)).toBe(1);
  });

  it('attaches readingTime to every post', () => {
    for (const p of posts.getAllPosts()) {
      expect(typeof p.readingTime).toBe('number');
      expect(p.readingTime).toBeGreaterThanOrEqual(1);
    }
  });
});

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
