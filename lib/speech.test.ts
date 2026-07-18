import { describe, it, expect } from "vitest";
import { splitIntoChunks, matchable, isHighlightOutOfView } from "./speech";

describe("splitIntoChunks", () => {
  it("splits on sentence terminators and keeps them", () => {
    expect(splitIntoChunks("안녕하세요. 반갑습니다!")).toEqual(["안녕하세요.", "반갑습니다!"]);
  });

  it("splits on newlines (paragraph breaks)", () => {
    expect(splitIntoChunks("첫 줄\n둘째 줄")).toEqual(["첫 줄", "둘째 줄"]);
  });

  it("drops empty and whitespace-only chunks", () => {
    expect(splitIntoChunks("하나.\n\n   \n둘.")).toEqual(["하나.", "둘."]);
  });

  it("collapses internal whitespace within a chunk", () => {
    expect(splitIntoChunks("여러   공백이    있는   문장")).toEqual(["여러 공백이 있는 문장"]);
  });

  it("returns empty array for empty or blank input", () => {
    expect(splitIntoChunks("")).toEqual([]);
    expect(splitIntoChunks("   \n  ")).toEqual([]);
  });

  it("splits an over-long terminator-less chunk at a word boundary", () => {
    const word = "가나다라마";
    const text = Array.from({ length: 60 }, () => word).join(" "); // 60 words, no terminator
    const chunks = splitIntoChunks(text, 100);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(100);
      expect(c).not.toMatch(/^\s|\s$/); // trimmed
    }
    // no content lost
    expect(chunks.join(" ")).toBe(text);
  });
});

describe("matchable", () => {
  it("keeps letters and numbers, lowercased", () => {
    expect(matchable("RAG4")).toBe("rag4");
  });

  it("strips spaces and punctuation", () => {
    expect(matchable("안녕, 하세요!")).toBe("안녕하세요");
  });

  it("strips the heading anchor # so DOM and JSON text still match", () => {
    expect(matchable("핵심 구조 #")).toBe("핵심구조");
  });

  it("ignores a trailing period (generator-added vs DOM)", () => {
    expect(matchable("왜 필요한가.")).toBe(matchable("왜 필요한가"));
  });

  it("keeps Hangul and Latin together, dropping the dash", () => {
    expect(matchable("self-attention")).toBe("selfattention");
  });

  it("returns empty string for punctuation/space only", () => {
    expect(matchable("  —  ")).toBe("");
  });
});

describe("isHighlightOutOfView", () => {
  const vh = 800;
  const insets = { top: 96, bottom: 40 };

  it("화면 중앙에 있으면 false", () => {
    expect(isHighlightOutOfView({ top: 300, bottom: 360 }, vh, insets)).toBe(false);
  });

  it("상단 inset 위로 올라가면 true", () => {
    expect(isHighlightOutOfView({ top: 50, bottom: 90 }, vh, insets)).toBe(true);
  });

  it("하단 inset 아래로 내려가면 true", () => {
    expect(isHighlightOutOfView({ top: 700, bottom: 790 }, vh, insets)).toBe(true);
  });

  it("상단 경계(top === insets.top)는 아직 보이는 것으로 본다(false)", () => {
    expect(isHighlightOutOfView({ top: 96, bottom: 140 }, vh, insets)).toBe(false);
  });

  it("하단 경계(bottom === vh - insets.bottom)는 아직 보이는 것으로 본다(false)", () => {
    expect(isHighlightOutOfView({ top: 700, bottom: 760 }, vh, insets)).toBe(false);
  });
});
