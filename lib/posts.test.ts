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

describe('getAllTags', () => {
  it('counts tags correctly, sorted by count desc', () => {
    const tags = posts.getAllTags();
    expect(tags[0]).toEqual({ tag: '일기', count: 2 });
    expect(tags.find((t) => t.tag === '개발')).toEqual({ tag: '개발', count: 1 });
  });
});

describe('getPostsByTag', () => {
  it('filters posts by tag', () => {
    expect(posts.getPostsByTag('개발').map((p) => p.slug)).toEqual(['second']);
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
