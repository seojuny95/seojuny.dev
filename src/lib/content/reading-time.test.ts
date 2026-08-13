import { describe, expect, it } from "vitest";

import { readingTime } from "./reading-time";

describe("readingTime", () => {
  it("returns at least one minute", () => {
    expect(readingTime("짧은 글")).toBe(1);
  });

  it("counts Korean characters", () => {
    expect(readingTime("가".repeat(1000))).toBe(2);
  });

  it("counts Latin words", () => {
    const text = Array.from({ length: 660 }, (_, index) => `word${index}`).join(
      " ",
    );
    expect(readingTime(text)).toBe(3);
  });

  it("counts fenced code more slowly", () => {
    const code = `\`\`\`js\n${"let x = 1;\n".repeat(250)}\`\`\``;
    expect(readingTime(code)).toBe(10);
  });

  it("adds twelve seconds per image", () => {
    expect(readingTime("![alt](/posts/x/img.png)\n".repeat(10))).toBe(2);
  });

  it("ignores image syntax inside code fences", () => {
    const code = `\`\`\`md\n${"![alt](/img.png)\n".repeat(10)}\`\`\``;
    expect(readingTime(code)).toBe(1);
  });
});
