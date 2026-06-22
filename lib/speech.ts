// 음성(Edge TTS) 생성과 본문 하이라이팅을 위한 순수 로직.
// 본문을 문장 단위로 나눠(생성기) 합성하고, 같은 문장을 본문 DOM에서 찾아 하이라이트한다.

const SENTENCE_BOUNDARY = /(?<=[.!?。…！？])\s+/;

/**
 * 하이라이팅 매칭용 정규화 — 글자/숫자만 남기고 소문자화.
 * 클라이언트가 audio.json의 문장 텍스트를 본문 DOM에서 찾을 때, 공백·문장부호·
 * 헤딩 앵커(#)·발음 교정 차이에 영향받지 않도록 양쪽을 같은 기준으로 맞춘다.
 */
export const matchable = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/**
 * 텍스트를 발화 단위 청크 배열로 나눈다.
 * - 줄바꿈(문단)과 문장 종결 부호 뒤에서 분리하고 부호는 유지한다.
 * - 청크 내부 공백은 단일 공백으로 정규화하고 앞뒤를 다듬는다.
 * - 종결 부호 없이 maxLen을 넘는 청크는 단어 경계에서 추가 분할한다.
 * - 빈/공백뿐인 청크는 버린다.
 */
export function splitIntoChunks(text: string, maxLen = 200): string[] {
  const result: string[] = [];
  for (const line of text.split(/\n+/)) {
    for (const piece of line.split(SENTENCE_BOUNDARY)) {
      const normalized = piece.replace(/\s+/g, ' ').trim();
      if (!normalized) continue;
      if (normalized.length <= maxLen) {
        result.push(normalized);
      } else {
        result.push(...hardWrap(normalized, maxLen));
      }
    }
  }
  return result;
}

function hardWrap(sentence: string, maxLen: number): string[] {
  const out: string[] = [];
  let current = '';
  for (const word of sentence.split(' ')) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxLen) {
      current += ' ' + word;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out;
}

/**
 * 하이라이트 구간이 뷰포트 밖(또는 상/하단 고정 UI에 가려지는 영역)으로
 * 벗어났는지 판정한다. insets는 상단 미니플레이어 높이·하단 여백을 흡수한다.
 */
export function isHighlightOutOfView(
  rect: { top: number; bottom: number },
  viewportHeight: number,
  insets: { top: number; bottom: number },
): boolean {
  return rect.top < insets.top || rect.bottom > viewportHeight - insets.bottom;
}
