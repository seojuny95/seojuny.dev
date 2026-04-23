import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-test-'));
const POSTS_TMP = path.join(TMP, 'content', 'posts');

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

  it('ignores fenced code blocks', () => {
    const prose = '가'.repeat(400);
    const code = '\n```js\n' + 'let x = 1;\n'.repeat(2000) + '```\n';
    expect(posts.readingTime(prose + code)).toBe(1);
  });

  it('attaches readingTime to every post', () => {
    for (const p of posts.getAllPosts()) {
      expect(typeof p.readingTime).toBe('number');
      expect(p.readingTime).toBeGreaterThanOrEqual(1);
    }
  });
});
