import { describe, it, expect } from "vitest";
import {
  stripParens,
  toSpeechText,
  mdxToReadableText,
  splitIntoChunks,
  alignWords,
  batchSentences,
  slugOf,
} from "./text";

describe("splitIntoChunks", () => {
  it("splits on sentence terminators and keeps them", () => {
    expect(splitIntoChunks("안녕하세요. 반갑습니다!")).toEqual([
      "안녕하세요.",
      "반갑습니다!",
    ]);
  });

  it("splits on newlines", () => {
    expect(splitIntoChunks("첫 줄\n둘째 줄")).toEqual(["첫 줄", "둘째 줄"]);
  });

  it("drops empty chunks and collapses whitespace", () => {
    expect(splitIntoChunks("하나.\n\n   \n여러   공백이   있는 문장")).toEqual([
      "하나.",
      "여러 공백이 있는 문장",
    ]);
  });

  it("returns an empty array for blank input", () => {
    expect(splitIntoChunks("")).toEqual([]);
    expect(splitIntoChunks("   \n  ")).toEqual([]);
  });

  it("wraps long chunks at word boundaries", () => {
    const word = "가나다라마";
    const text = Array.from({ length: 60 }, () => word).join(" ");
    const chunks = splitIntoChunks(text, 100);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true);
    expect(chunks.join(" ")).toBe(text);
  });

  it("trims every wrapped chunk", () => {
    const chunks = splitIntoChunks("하나 둘 셋 넷 다섯", 5);

    expect(chunks.every((chunk) => !/^\s|\s$/.test(chunk))).toBe(true);
  });
});

describe("slugOf", () => {
  it("strips YYYY-MM-DD- prefix and .mdx", () => {
    expect(
      slugOf("content/posts/2026-05-15-attention-is-all-you-need.mdx"),
    ).toBe("attention-is-all-you-need");
  });

  it("uses basename only", () => {
    expect(slugOf("/abs/path/2026-01-02-foo.mdx")).toBe("foo");
  });

  it("leaves a name without date prefix", () => {
    expect(slugOf("about.mdx")).toBe("about");
  });
});

describe("stripParens", () => {
  it("removes half-width parenthetical", () => {
    expect(stripParens("가중치(weight)이다")).toBe("가중치이다");
  });

  it("removes full-width parenthetical", () => {
    expect(stripParens("값（test）끝")).toBe("값끝");
  });

  it("removes multiple parentheticals", () => {
    expect(stripParens("A(a) B(b)")).toBe("A B");
  });

  it("drops the space left before punctuation", () => {
    expect(stripParens("파인튜닝(fine-tuning), 그중에서도")).toBe(
      "파인튜닝, 그중에서도",
    );
  });

  it("collapses doubled spaces created by removal", () => {
    expect(stripParens("앞 (군더더기) 뒤")).toBe("앞 뒤");
  });

  it("leaves text without parentheses unchanged", () => {
    expect(stripParens("괄호 없는 문장")).toBe("괄호 없는 문장");
  });
});

describe("toSpeechText", () => {
  it("substitutes glossary terms at word boundaries", () => {
    expect(toSpeechText("RAG와 LLM을 쓴다")).toBe("래그와 엘엘엠을 쓴다");
  });

  it("handles multi-word keys", () => {
    expect(toSpeechText("PI Lab에서 배웠다")).toBe("파이 랩에서 배웠다");
  });

  it("strips parentheses before substituting", () => {
    expect(toSpeechText("PEFT(Parameter-Efficient Fine-Tuning)는 가볍다")).toBe(
      "펩트는 가볍다",
    );
  });

  it("substitutes QLoRA as a whole, not via LoRA", () => {
    expect(toSpeechText("QLoRA는 4bit")).toBe("큐로라는 4bit");
  });

  it("is case-sensitive (does not touch lowercase words)", () => {
    expect(toSpeechText("drag and rag")).toBe("drag and rag");
  });

  it("does not substitute an acronym embedded in a larger word", () => {
    expect(toSpeechText("GPTQ")).toBe("GPTQ");
  });
});

describe("mdxToReadableText", () => {
  const body = (s: string) => mdxToReadableText(`---\ntitle: "T"\n---\n${s}`);

  it("drops frontmatter", () => {
    expect(
      mdxToReadableText('---\ntitle: "제목"\n---\n본문이다'),
    ).not.toContain("제목");
  });

  it("removes fenced code blocks", () => {
    expect(body("```js\nconst x = 1\n```\n설명")).not.toContain("const x");
  });

  it("keeps inline code text", () => {
    expect(body("`useState`를 쓴다").trim()).toBe("useState를 쓴다");
  });

  it("strips heading marker and adds a period when missing", () => {
    expect(body("## 핵심 구조").trim()).toBe("핵심 구조.");
  });

  it("keeps an existing terminal mark on a heading", () => {
    expect(body("### 왜 필요한가?").trim()).toBe("왜 필요한가?");
  });

  it("converts links to their text", () => {
    expect(body("[랭체인](https://www.langchain.com/)을 쓴다").trim()).toBe(
      "랭체인을 쓴다",
    );
  });

  it("removes raw URLs", () => {
    expect(body("출처 https://arxiv.org/abs/1706.03762 참고")).not.toContain(
      "http",
    );
  });

  it("removes HTML/JSX tags but keeps inner text", () => {
    expect(body("이건 <strong>중요</strong>하다").trim()).toBe("이건 중요하다");
  });

  it("unwraps bold, italic, strikethrough", () => {
    expect(body("**굵게** *기울* ~~취소~~").trim()).toBe("굵게 기울 취소");
  });

  it("removes block and inline math", () => {
    expect(body("값 $a_i$ 와 $$E=mc^2$$ 끝")).not.toMatch(/a_i|mc/);
  });

  it("removes image syntax", () => {
    expect(body("![다이어그램](/posts/x/y.svg)")).not.toContain("다이어그램");
  });

  it("removes table rows", () => {
    expect(body("| 헤더 | 값 |\n| --- | --- |\n본문")).not.toContain("헤더");
  });

  it("removes blockquote markers", () => {
    expect(body("> 인용문이다").trim()).toBe("인용문이다");
  });
});

describe("alignWords", () => {
  const w = (text: string, offset: number, duration: number) => ({
    text,
    offset,
    duration,
  });

  it("assigns word times to the containing sentence (ticks → seconds)", () => {
    const sentences = ["안녕 하세요", "끝"];
    const words = [w("안녕", 0, 1e7), w("하세요", 1e7, 1e7), w("끝", 2e7, 1e7)];
    expect(alignWords(sentences, words)).toEqual([
      { text: "안녕 하세요", start: 0, end: 2 },
      { text: "끝", start: 2, end: 3 },
    ]);
  });

  it("converts 100ns ticks to seconds", () => {
    const [s] = alignWords(["하나"], [w("하나", 5e6, 5e6)]);
    expect(s.start).toBeCloseTo(0.5);
    expect(s.end).toBeCloseTo(1.0);
  });

  it("fills a sentence with no matched words using the previous end", () => {
    const result = alignWords(["하나", "둘"], [w("하나", 0, 1e7)]);
    expect(result[0]).toEqual({ text: "하나", start: 0, end: 1 });
    expect(result[1]).toEqual({ text: "둘", start: 1, end: 1 });
  });

  it("skips words not found in the text without throwing", () => {
    const result = alignWords(
      ["하나"],
      [w("없는단어", 0, 1e7), w("하나", 1e7, 1e7)],
    );
    expect(result[0].start).toBeCloseTo(1);
  });
});

describe("batchSentences", () => {
  it("keeps small sentences in a single batch", () => {
    expect(batchSentences(["a", "b", "c"])).toEqual([["a", "b", "c"]]);
  });

  it("returns an empty array for no sentences", () => {
    expect(batchSentences([])).toEqual([]);
  });

  it("splits at sentence boundaries when over the char budget", () => {
    const big = "a".repeat(900);
    const batches = batchSentences([big, big, big]);
    expect(batches).toEqual([[big], [big], [big]]);
  });

  it("never splits inside a sentence (a lone over-budget sentence is its own batch)", () => {
    const huge = "x".repeat(5000);
    expect(batchSentences([huge])).toEqual([[huge]]);
  });
});
