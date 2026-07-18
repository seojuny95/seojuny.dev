// 음성(Edge TTS) 생성을 위한 순수 텍스트 로직 — I/O 없는 부분만 모아 테스트 가능하게 둔다.
// (실제 합성·파일 입출력은 scripts/generate-audio.ts)
import path from "node:path";
import matter from "gray-matter";

export type Sentence = { text: string; start: number; end: number };

// Edge TTS 단일 요청은 약 600초(10분)에서 잘린다. 그보다 짧게 배치로 나눈다.
const BATCH_CHARS = 1500;

// 영어 용어 발음 교정 (TTS 전용). 이 라이브러리는 SSML을 escape하므로 음성으로 읽을
// 텍스트 자체를 한글 표기로 치환한다. 화면/하이라이트는 원문을 그대로 쓰므로 영향 없다.
const PRONUNCIATION: Record<string, string> = {
  "PI Lab": "파이 랩",
  // 구절 먼저(개별 단어보다 앞) — 논문 제목·복합어
  "Attention Is All You Need": "어텐션 이즈 올 유 니드",
  "Visual Attention Network": "비주얼 어텐션 네트워크",
  "gpt-4o-mini": "지피티 포 오 미니", // 반드시 'gpt-4o'보다 먼저
  "page.get_images": "페이지 겟 이미지스", // 'page'보다 먼저
  "text-embedding-3-small": "텍스트 임베딩 쓰리 스몰",
  "rate limit": "레이트 리밋",
  Attention: "어텐션",
  arXiv: "아카이브",
  Chroma: "크로마",
  pypdf: "파이피디에프",
  pdfplumber: "피디에프 플럼버",
  Streamlit: "스트림릿",
  FastAPI: "패스트에이피아이",
  OpenAI: "오픈에이아이",
  Sprint: "스프린트",
  Transformer: "트랜스포머",
  Reference: "레퍼런스",
  DeiT: "데이트",
  VAN: "밴",
  crop: "크롭",
  covers: "커버스",
  figure: "피규어",
  Table: "테이블",
  table: "테이블",
  type: "타입",
  page: "페이지",
  PNG: "피엔지",
  Sprint2: "스프린트 투",
  Sprint3: "스프린트 쓰리",
  LangChain: "랭체인",
  Llama: "라마",
  Claude: "클로드",
  React: "리액트",
  RAG: "래그",
  LLM: "엘엘엠",
  "GPT-4o": "지피티 포 오",
  GPT: "지피티",
  LoRA: "로라",
  QLoRA: "큐로라",
  PEFT: "펩트",
  RNN: "알엔엔",
  CNN: "씨엔엔",
  ViT: "비전 트랜스포머",
  VLM: "브이엘엠",
  CLIP: "클립",
  AST: "에이에스티",
  AGI: "에이지아이",
  SDK: "에스디케이",
  MIT: "엠아이티",
  FFN: "에프에프엔",
  MLP: "엠엘피",
  RRF: "알알에프",
  MSE: "엠에스이",
  NF4: "엔에프 포",
  SOTA: "소타",
  AI: "에이아이",
  GPU: "지피유",
  API: "에이피아이",
  DB: "디비",
  GB: "기가바이트",
  PDF: "피디에프",
  ffmpeg: "에프엠펙",
  OPENAI_API_KEY: "오픈에이아이 에이피아이 키",
  "gpt-4o": "지피티 포 오",
  "whisper-1": "위스퍼 원",
  "mlx-whisper": "엠엘엑스 위스퍼",
  "qwen2.5vl": "퀜 이 점 오 브이엘",
  base64: "베이스 식스티포",
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 괄호 안 내용은 음성에서 제거(한글-영문 병기 중복 방지). 화면/하이라이트는 원문 유지.
export function stripParens(text: string): string {
  return text
    .replace(/[(（][^)）]*[)）]/g, "")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type SpeechLocale = "ko" | "en";

// 영어 본문은 영어 보이스가 직접 읽으므로 한글 발음 교정을 적용하지 않는다.
// (PRONUNCIATION은 한국어 보이스가 영어 용어를 읽게 하려는 것이라 영어에는 역효과.)
export function toSpeechText(text: string, locale: SpeechLocale = "ko"): string {
  if (locale === "en") return text.replace(/\s{2,}/g, " ").trim();
  let t = stripParens(text);
  for (const [en, ko] of Object.entries(PRONUNCIATION)) {
    t = t.replace(new RegExp(`\\b${escapeRegExp(en)}\\b`, "g"), ko);
  }
  return t;
}

// MDX 본문에서 "낭독할 텍스트"만 남긴다. 본문 페이지의 .prose-blog가 화면에 보여주는
// 텍스트와 일치시키는 게 목표 — 코드블록/표/이미지(캡션)는 제외, 헤딩·인라인 텍스트는 포함.
export function mdxToReadableText(raw: string): string {
  let t = matter(raw).content;
  t = t.replace(/```[\s\S]*?```/g, "\n"); // 펜스 코드블록 제거
  t = t.replace(/<!--[\s\S]*?-->/g, ""); // 주석 제거
  t = t.replace(/\$\$[\s\S]*?\$\$/g, " "); // 블록 수식 제거(KaTeX는 화면에서 별도 렌더)
  t = t.replace(/\$[^$\n]+\$/g, " "); // 인라인 수식 제거
  t = t.replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, ""); // 이미지 라인 제거
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // 인라인 이미지 제거
  t = t
    .split("\n")
    .filter((line) => !/^\s*\|.*\|\s*$/.test(line)) // 표 행 제거
    .join("\n");
  // 헤딩: 기호 제거 + 종결부호 없으면 마침표 추가(문장 억양·앞뒤 쉼으로 구분되게)
  t = t.replace(/^\s{0,3}#{1,6}[ \t]+(.+?)[ \t]*$/gm, (_m, h: string) =>
    /[.!?。…！？]$/.test(h.trim()) ? h.trim() : `${h.trim()}.`
  );
  t = t.replace(/^\s{0,3}>\s?/gm, ""); // 인용 기호 제거
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // 링크 → 텍스트
  t = t.replace(/https?:\/\/\S+/g, " "); // 본문에 노출된 raw URL 제거(낭독 방지)
  t = t.replace(/<\/?[a-zA-Z][^>]*>/g, ""); // HTML/JSX 태그 제거(<strong> 등, 텍스트는 유지)
  t = t.replace(/`([^`]+)`/g, "$1"); // 인라인 코드 → 텍스트
  t = t.replace(/\*\*(.*?)\*\*/g, "$1"); // 굵게(*)
  t = t.replace(/\*([^*\n]+?)\*/g, "$1"); // 기울임(*)
  // 단어 안 밑줄(예: OPENAI_API_KEY)은 기울임으로 보지 않는다 — 양옆이 영숫자가 아닐 때만.
  t = t.replace(/(^|[^A-Za-z0-9])__(.+?)__(?![A-Za-z0-9])/g, "$1$2"); // 굵게(_)
  t = t.replace(/(^|[^A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/g, "$1$2"); // 기울임(_)
  t = t.replace(/~~(.*?)~~/g, "$1"); // 취소선
  return t;
}

// 순서대로 들어오는 단어 타이밍을 문장에 누적 정렬한다(문장별 start/end 초 단위).
// 합성에 보낸 실제 텍스트(joined)에서 각 단어 위치를 직접 찾아 그 위치가 속한 문장에
// 시각을 배정한다 — 글자수 누적 방식의 드리프트 없음(영어·숫자·문장부호에도 안정적).
export function alignWords(
  sentences: string[],
  words: { offset: number; duration: number; text: string }[]
): Sentence[] {
  const joined = sentences.join(" ");
  const sentenceEnd: number[] = [];
  let pos = 0;
  for (const s of sentences) {
    pos += s.length;
    sentenceEnd.push(pos);
    pos += 1; // 문장 사이 공백
  }

  const out: Sentence[] = sentences.map((text) => ({ text, start: Infinity, end: 0 }));
  let search = 0;
  let si = 0;
  for (const w of words) {
    const at = joined.indexOf(w.text, search);
    if (at === -1) continue;
    search = at + w.text.length;
    while (si < sentenceEnd.length - 1 && at >= sentenceEnd[si]) si++;
    out[si].start = Math.min(out[si].start, w.offset / 1e7);
    out[si].end = Math.max(out[si].end, (w.offset + w.duration) / 1e7);
  }

  // 단어가 한 개도 매칭 안 된 문장은 이웃 시각으로 메운다.
  let prevEnd = 0;
  for (const s of out) {
    if (!Number.isFinite(s.start)) {
      s.start = prevEnd;
      s.end = prevEnd;
    }
    prevEnd = s.end;
  }
  return out;
}

// 문장을 문자 예산 단위 배치로 묶는다(배치 경계는 문장 경계와 항상 일치).
export function batchSentences(sentences: string[]): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  let len = 0;
  for (const s of sentences) {
    if (current.length && len + s.length > BATCH_CHARS) {
      batches.push(current);
      current = [];
      len = 0;
    }
    current.push(s);
    len += s.length + 1;
  }
  if (current.length) batches.push(current);
  return batches;
}

export const slugOf = (file: string) =>
  path
    .basename(file)
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/\.mdx$/, "");
