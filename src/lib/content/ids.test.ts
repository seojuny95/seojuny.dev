import { describe, expect, it } from "vitest";

import {
  aboutIdFromEntry,
  localeFromEntry,
  postIdFromEntry,
  slugFromEntry,
} from "./ids";

describe("content IDs", () => {
  it("creates a Korean post ID without its date prefix", () => {
    expect(postIdFromEntry("ko/2026-08-07-react-alive.mdx")).toBe(
      "ko/react-alive",
    );
  });

  it("creates an English post ID without its date prefix", () => {
    expect(postIdFromEntry("en/2026-08-07-react-alive.mdx")).toBe(
      "en/react-alive",
    );
  });

  it("creates locale IDs for About entries", () => {
    expect(aboutIdFromEntry("ko.mdx")).toBe("ko");
    expect(aboutIdFromEntry("en.mdx")).toBe("en");
  });

  it("rejects unsupported About locales", () => {
    expect(() => aboutIdFromEntry("ja.mdx")).toThrow(
      "Invalid About locale: ja.mdx",
    );
  });

  it("rejects unsupported post locales", () => {
    expect(() => postIdFromEntry("ja/2026-01-01-post.mdx")).toThrow(
      "Invalid post locale: ja/2026-01-01-post.mdx",
    );
  });

  it("normalizes Windows paths", () => {
    expect(localeFromEntry("en\\2026-01-01-post.mdx")).toBe("en");
    expect(slugFromEntry("en\\2026-01-01-post.mdx")).toBe("post");
  });
});
