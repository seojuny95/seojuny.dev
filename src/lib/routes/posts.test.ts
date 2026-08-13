import { describe, expect, it, vi } from "vitest";

vi.mock("astro:content", () => ({ getCollection: vi.fn() }));

import type { Post } from "../content/posts";
import { buildPostStaticPathEntries } from "./posts";

function post(slug: string): Post {
  return {
    id: `ko/${slug}`,
    body: "body",
    collection: "posts",
    locale: "ko",
    readingTime: 1,
    slug,
    data: {
      date: "2026-01-01",
      draft: false,
      summary: undefined,
      tags: [],
      title: slug,
    },
  } as Post;
}

describe("buildPostStaticPathEntries", () => {
  it("builds adjacent navigation and translated alternate paths", () => {
    const first = post("first");
    const second = post("second");
    const paths = buildPostStaticPathEntries(
      [first, second],
      [{ ...first, id: "en/first", locale: "en" }],
      "ko",
    );

    expect(paths[0]).toMatchObject({
      params: { slug: "first" },
      props: {
        alternatePaths: { en: "/en/first", ko: "/first" },
        next: second,
        prev: undefined,
      },
    });
    expect(paths[1].props.alternatePaths).toEqual({ ko: "/second" });
    expect(paths[1].props.prev).toBe(first);
  });
});
