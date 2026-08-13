import { describe, expect, it } from "vitest";

import { localeFromPathname, localePath, switchLocalePath } from "./routing";

describe("localeFromPathname", () => {
  it("detects English only from the first path segment", () => {
    expect(localeFromPathname("/en/missing")).toBe("en");
    expect(localeFromPathname("/content/en/missing")).toBe("ko");
    expect(localeFromPathname("/missing")).toBe("ko");
  });
});

describe("localePath", () => {
  it("keeps Korean at the root", () => {
    expect(localePath("ko")).toBe("/");
    expect(localePath("ko", "/about")).toBe("/about");
  });

  it("places English below /en", () => {
    expect(localePath("en")).toBe("/en");
    expect(localePath("en", "/about")).toBe("/en/about");
  });
});

describe("switchLocalePath", () => {
  it("switches shared static pages", () => {
    expect(switchLocalePath("/about", "en", [])).toBe("/en/about");
    expect(switchLocalePath("/en", "ko", [])).toBe("/");
  });

  it("switches a post when its translation exists", () => {
    expect(switchLocalePath("/react-alive", "en", ["react-alive"])).toBe(
      "/en/react-alive",
    );
  });

  it("falls back to the target home for an untranslated post", () => {
    expect(switchLocalePath("/en/only-english", "ko", [])).toBe("/");
  });
});
