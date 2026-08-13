export const matchable = (value: string): string =>
  value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export type Timing = { end: number; start: number; text: string };

export type Segment = {
  block: Element | null;
  end: number;
  range: Range | null;
  start: number;
};

export interface HighlightLike {
  add(range: Range): void;
  clear(): void;
}

interface HighlightConstructor {
  new (): HighlightLike;
}

interface HighlightRegistry {
  delete(name: string): void;
  set(name: string, highlight: HighlightLike): void;
}

const BLOCK_SELECTOR =
  "p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, td, th";

export function getHighlightApi(): {
  Ctor: HighlightConstructor;
  registry: HighlightRegistry;
} | null {
  if (typeof CSS === "undefined") return null;

  const registry = (CSS as unknown as { highlights?: HighlightRegistry })
    .highlights;
  const Ctor = (
    globalThis as unknown as {
      Highlight?: HighlightConstructor;
    }
  ).Highlight;

  return registry && Ctor ? { Ctor, registry } : null;
}

export function buildSegments(timings: Timing[]): Segment[] {
  const root = document.querySelector(".prose-blog");
  if (!root) {
    return timings.map(({ end, start }) => ({
      block: null,
      end,
      range: null,
      start,
    }));
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest("pre, .table-wrap, figcaption, .katex")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  let normalizedText = "";
  const sourceMap: { node: Text; offset: number }[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? "";
    for (let offset = 0; offset < text.length; offset++) {
      const normalizedCharacter = matchable(text[offset]);
      if (!normalizedCharacter) continue;
      normalizedText += normalizedCharacter;
      sourceMap.push({ node: node as Text, offset });
    }
  }

  const segments: Segment[] = [];
  let cursor = 0;

  for (const timing of timings) {
    const needle = matchable(timing.text);
    let range: Range | null = null;
    let block: Element | null = null;

    if (needle) {
      const index = normalizedText.indexOf(needle, cursor);
      if (index !== -1) {
        const start = sourceMap[index];
        const end = sourceMap[index + needle.length - 1];
        range = document.createRange();
        range.setStart(start.node, start.offset);
        range.setEnd(end.node, end.offset + 1);
        block = start.node.parentElement?.closest(BLOCK_SELECTOR) ?? null;
        cursor = index + needle.length;
      }
    }

    segments.push({
      block,
      end: timing.end,
      range,
      start: timing.start,
    });
  }

  return segments;
}

export function isHighlightOutOfView(
  rect: { bottom: number; top: number },
  viewportHeight: number,
  insets: { bottom: number; top: number },
): boolean {
  return rect.top < insets.top || rect.bottom > viewportHeight - insets.bottom;
}
