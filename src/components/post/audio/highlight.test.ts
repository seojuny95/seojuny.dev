import { describe, it, expect } from "vitest";
import { isHighlightOutOfView, matchable } from "./highlight";

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
    expect(isHighlightOutOfView({ top: 300, bottom: 360 }, vh, insets)).toBe(
      false,
    );
  });

  it("상단 inset 위로 올라가면 true", () => {
    expect(isHighlightOutOfView({ top: 50, bottom: 90 }, vh, insets)).toBe(
      true,
    );
  });

  it("하단 inset 아래로 내려가면 true", () => {
    expect(isHighlightOutOfView({ top: 700, bottom: 790 }, vh, insets)).toBe(
      true,
    );
  });

  it("상단 경계(top === insets.top)는 아직 보이는 것으로 본다(false)", () => {
    expect(isHighlightOutOfView({ top: 96, bottom: 140 }, vh, insets)).toBe(
      false,
    );
  });

  it("하단 경계(bottom === vh - insets.bottom)는 아직 보이는 것으로 본다(false)", () => {
    expect(isHighlightOutOfView({ top: 700, bottom: 760 }, vh, insets)).toBe(
      false,
    );
  });
});
