import { describe, expect, it } from "vitest";

import { prefersEnglish } from "./accept-language";

describe("prefersEnglish", () => {
  it("selects English when it has the highest quality", () => {
    expect(prefersEnglish("ko;q=0.5,en-US;q=0.9")).toBe(true);
  });

  it("keeps Korean when Korean wins or ties", () => {
    expect(prefersEnglish("ko-KR,en;q=0.8")).toBe(false);
    expect(prefersEnglish("en,ko")).toBe(false);
  });

  it("ignores malformed quality values", () => {
    expect(prefersEnglish("en;q=nope,ko;q=0.5")).toBe(false);
    expect(prefersEnglish("en;q=2,ko;q=0.5")).toBe(false);
  });
});
