import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCollection } = vi.hoisted(() => ({ getCollection: vi.fn() }));

vi.mock("astro:content", () => ({ getCollection }));

import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getSearchIndex,
  hasPost,
  type PostEntry,
} from "./posts";

function entry(
  id: string,
  date: string,
  options: { draft?: boolean; summary?: string; title?: string } = {},
): PostEntry {
  return {
    id,
    body: "one two three",
    collection: "posts",
    data: {
      date,
      draft: options.draft ?? false,
      summary: options.summary,
      tags: ["test"],
      title: options.title ?? id,
    },
  } as PostEntry;
}

const entries = [
  entry("ko/new", "2026-03-01", { title: "New" }),
  entry("ko/old", "2026-01-01", { summary: "Old summary", title: "Old" }),
  entry("ko/draft", "2026-04-01", { draft: true }),
  entry("en/english", "2026-02-01", { title: "English" }),
];

beforeEach(() => {
  getCollection.mockImplementation(
    async (_collection: string, filter?: (value: PostEntry) => boolean) =>
      filter ? entries.filter(filter) : entries,
  );
});

describe("post collection", () => {
  it("filters drafts and locales, then sorts newest first", async () => {
    const posts = await getAllPosts("ko");

    expect(posts.map((post) => post.slug)).toEqual(["new", "old"]);
    expect(posts.every((post) => post.locale === "ko")).toBe(true);
    expect(posts[0].readingTime).toBeGreaterThan(0);
  });

  it("finds posts and reports missing posts", async () => {
    await expect(getPostBySlug("old", "ko")).resolves.toMatchObject({
      slug: "old",
    });
    await expect(getPostBySlug("missing", "ko")).rejects.toThrow(
      "Post not found: missing (ko)",
    );
    await expect(hasPost("english", "en")).resolves.toBe(true);
    await expect(hasPost("english", "ko")).resolves.toBe(false);
  });

  it("builds previous and next navigation in display order", async () => {
    await expect(getAdjacentPosts("new", "ko")).resolves.toEqual({
      next: expect.objectContaining({ slug: "old" }),
      prev: undefined,
    });
    await expect(getAdjacentPosts("old", "ko")).resolves.toEqual({
      next: undefined,
      prev: expect.objectContaining({ slug: "new" }),
    });
  });

  it("builds a locale-specific search index", async () => {
    await expect(getSearchIndex("ko")).resolves.toEqual([
      { slug: "new", summary: undefined, tags: ["test"], title: "New" },
      {
        slug: "old",
        summary: "Old summary",
        tags: ["test"],
        title: "Old",
      },
    ]);
  });
});
