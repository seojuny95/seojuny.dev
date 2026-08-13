import { describe, expect, it } from "vitest";

import { isLocale, otherLocale } from "./locales";

describe("otherLocale", () => {
  it("returns the opposite supported locale", () => {
    expect(otherLocale("ko")).toBe("en");
    expect(otherLocale("en")).toBe("ko");
  });
});

describe("isLocale", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(false);
  });
});
