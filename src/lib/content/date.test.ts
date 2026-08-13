import { describe, expect, it } from "vitest";

import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats Korean dates by default", () => {
    expect(formatDate("2026-04-10")).toBe("2026년 4월 10일");
  });

  it("formats English dates", () => {
    expect(formatDate("2026-04-10", "en")).toBe("April 10, 2026");
  });

  it("returns invalid input unchanged", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
