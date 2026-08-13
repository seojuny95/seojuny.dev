import { describe, expect, it } from "vitest";

import type { Post } from "../content/posts";
import { buildPostJsonLd, buildSiteJsonLd } from "./json-ld";

const post = {
  id: "en/example",
  body: "body",
  collection: "posts",
  locale: "en",
  readingTime: 1,
  slug: "example",
  data: {
    date: "2026-01-01",
    draft: false,
    summary: "Summary",
    tags: ["Astro"],
    title: "Example",
  },
} as Post;

describe("JSON-LD", () => {
  it("uses localized site identity", () => {
    expect(buildSiteJsonLd("en")[0]).toMatchObject({
      inLanguage: "en-US",
      url: "https://seojuny.dev/en",
    });
  });

  it("builds localized canonical post URLs", () => {
    expect(buildPostJsonLd(post, "en")).toMatchObject({
      image: "https://seojuny.dev/en/example/opengraph-image",
      inLanguage: "en-US",
      mainEntityOfPage: "https://seojuny.dev/en/example",
      url: "https://seojuny.dev/en/example",
    });
  });
});
