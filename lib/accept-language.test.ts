import { describe, it, expect } from "vitest";
import { prefersEnglish } from "./accept-language";

describe("prefersEnglish", () => {
  it("true for English-first browsers", () => {
    expect(prefersEnglish("en-US,en;q=0.9")).toBe(true);
    expect(prefersEnglish("en")).toBe(true);
    expect(prefersEnglish("en-GB,en;q=0.9,fr;q=0.8")).toBe(true);
  });

  it("false for Korean-first browsers", () => {
    expect(prefersEnglish("ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7")).toBe(false);
    expect(prefersEnglish("ko")).toBe(false);
  });

  it("respects q-value ordering over listing order", () => {
    expect(prefersEnglish("en;q=0.5,ko;q=0.9")).toBe(false);
    expect(prefersEnglish("ko;q=0.5,en;q=0.9")).toBe(true);
  });

  it("false for empty, wildcard, or unrelated headers", () => {
    expect(prefersEnglish("")).toBe(false);
    expect(prefersEnglish("*")).toBe(false);
    expect(prefersEnglish("ja-JP,ja;q=0.9")).toBe(false);
  });

  it("ignores malformed q-values", () => {
    expect(prefersEnglish("en;q=banana,ko;q=0.9")).toBe(false);
  });
});
