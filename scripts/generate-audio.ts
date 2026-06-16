// 글마다 Edge TTS로 음성(audio.mp3)과 문장별 타이밍(audio.json)을 생성한다.
// 작성/수정 시 로컬에서 실행하고 결과물을 커밋한다(빌드는 네트워크에 의존하지 않음).
//
//   pnpm generate:audio              # 오디오 없는 글만 (증분 — 새 글 추가 시)
//   pnpm generate:audio --all        # 전체 재생성 (글로사리·보이스·추출 로직 변경 시)
//   pnpm generate:audio what-is-rag  # 특정 글만 (본문 수정 시)
//
// 산출물: public/posts/<slug>/audio.mp3, public/posts/<slug>/audio.json
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { EdgeTTS, Constants } from '@andresaya/edge-tts';
import { splitIntoChunks } from '../lib/speech';

const VOICE = 'ko-KR-HyunsuMultilingualNeural';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUT_ROOT = path.join(process.cwd(), 'public', 'posts');
// Edge TTS 단일 요청은 약 600초(10분)에서 잘린다. 그보다 짧게 배치로 나눠 합성한 뒤
// 오디오를 이어 붙이고 타이밍을 누적 보정한다(배치당 문자 예산 ≈ 4~5분 분량).
const BATCH_CHARS = 1500;

// 영어 용어 발음 교정 (TTS 전용). 이 라이브러리는 SSML을 escape하므로 음성으로 읽을
// 텍스트 자체를 한글 표기로 치환한다. 화면/하이라이트는 원문을 그대로 쓰므로 영향 없다.
// 새 용어가 어색하게 읽히면 여기에 "영어표기: '읽을한글'"을 추가/수정하면 된다.
const PRONUNCIATION: Record<string, string> = {
  // 고유명사
  'PI Lab': '파이 랩',
  Sprint2: '스프린트 투',
  LangChain: '랭체인',
  Llama: '라마',
  Claude: '클로드',
  React: '리액트',
  // 약어·모델/기법
  RAG: '래그',
  LLM: '엘엘엠',
  GPT: '지피티',
  LoRA: '로라',
  QLoRA: '큐로라',
  PEFT: '펩트',
  RNN: '알엔엔',
  CNN: '씨엔엔',
  FFN: '에프에프엔',
  MLP: '엠엘피',
  RRF: '알알에프',
  MSE: '엠에스이',
  NF4: '엔에프 포',
  SOTA: '소타',
  AI: '에이아이',
  GPU: '지피유',
  API: '에이피아이',
  DB: '디비',
  GB: '기가바이트',
  PDF: '피디에프',
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 괄호 안 내용은 음성에서 제거(한글-영문 병기 중복 방지). 화면/하이라이트는 원문 유지.
function stripParens(text: string): string {
  return text
    .replace(/[(（][^)）]*[)）]/g, '')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function toSpeechText(text: string): string {
  let t = stripParens(text);
  for (const [en, ko] of Object.entries(PRONUNCIATION)) {
    t = t.replace(new RegExp(`\\b${escapeRegExp(en)}\\b`, 'g'), ko);
  }
  return t;
}

type Sentence = { text: string; start: number; end: number };

// MDX 본문에서 "낭독할 텍스트"만 남긴다. 본문 페이지의 .prose-blog가 화면에 보여주는
// 텍스트와 일치시키는 게 목표 — 코드블록/표/이미지(캡션)는 제외, 헤딩·인라인 텍스트는 포함.
function mdxToReadableText(raw: string): string {
  let t = matter(raw).content;
  t = t.replace(/```[\s\S]*?```/g, '\n'); // 펜스 코드블록 제거
  t = t.replace(/<!--[\s\S]*?-->/g, ''); // 주석 제거
  t = t.replace(/\$\$[\s\S]*?\$\$/g, ' '); // 블록 수식 제거(KaTeX는 화면에서 별도 렌더)
  t = t.replace(/\$[^$\n]+\$/g, ' '); // 인라인 수식 제거
  t = t.replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, ''); // 이미지 라인 제거
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, ''); // 인라인 이미지 제거
  t = t
    .split('\n')
    .filter((line) => !/^\s*\|.*\|\s*$/.test(line)) // 표 행 제거
    .join('\n');
  // 헤딩: 기호 제거 + 종결부호 없으면 마침표 추가(문장 억양·앞뒤 쉼으로 구분되게)
  t = t.replace(/^\s{0,3}#{1,6}[ \t]+(.+?)[ \t]*$/gm, (_m, h: string) =>
    /[.!?。…！？]$/.test(h.trim()) ? h.trim() : `${h.trim()}.`,
  );
  t = t.replace(/^\s{0,3}>\s?/gm, ''); // 인용 기호 제거
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1'); // 링크 → 텍스트
  t = t.replace(/https?:\/\/\S+/g, ' '); // 본문에 노출된 raw URL 제거(낭독 방지)
  t = t.replace(/<\/?[a-zA-Z][^>]*>/g, ''); // HTML/JSX 태그 제거(<strong> 등, 텍스트는 유지)
  t = t.replace(/`([^`]+)`/g, '$1'); // 인라인 코드 → 텍스트
  t = t.replace(/(\*\*|__)(.*?)\1/g, '$2'); // 굵게
  t = t.replace(/(\*|_)(.*?)\1/g, '$2'); // 기울임
  t = t.replace(/~~(.*?)~~/g, '$1'); // 취소선
  return t;
}

// 순서대로 들어오는 단어 타이밍을 문장에 누적 정렬한다(문장별 start/end 초 단위).
function alignWords(
  sentences: string[],
  words: { offset: number; duration: number; text: string }[],
): Sentence[] {
  // 합성에 보낸 실제 텍스트(joined)에서 각 단어의 위치를 직접 찾아, 그 위치가 속한
  // 문장에 시각을 배정한다. 단어 텍스트는 joined의 부분문자열이라 정렬이 정확하다
  // (글자수 누적 방식의 드리프트 없음 — 영어·숫자·문장부호에도 안정적).
  const joined = sentences.join(' ');
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

function postFiles(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(POSTS_DIR, f));
}

const slugOf = (file: string) =>
  path.basename(file).replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.mdx$/, '');

// 문장을 문자 예산 단위 배치로 묶는다(배치 경계는 문장 경계와 항상 일치).
function batchSentences(sentences: string[]): string[][] {
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

function mp3Duration(file: string): number {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    file,
  ]);
  return parseFloat(out.toString().trim());
}

async function synthesizeBatch(sentences: string[], outPath: string): Promise<Sentence[]> {
  const tts = new EdgeTTS();
  await tts.synthesize(sentences.join(' '), VOICE, {
    outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  });
  await tts.toFile(outPath.replace(/\.mp3$/, ''));
  const words = tts.getWordBoundaries() as {
    offset: number;
    duration: number;
    text: string;
  }[];
  return alignWords(sentences, words);
}

async function generate(file: string): Promise<void> {
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = matter(raw);
  const slug = slugOf(file);
  if (data.draft) {
    console.log(`skip (draft): ${slug}`);
    return;
  }

  const sentences = splitIntoChunks(mdxToReadableText(raw)); // 화면/하이라이트용 원문
  if (sentences.length === 0) {
    console.log(`skip (empty): ${slug}`);
    return;
  }
  const ttsSentences = sentences.map(toSpeechText); // 합성용: 괄호 제거 + 발음 교정

  const outDir = path.join(OUT_ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });

  const batches = batchSentences(ttsSentences);
  const parts: string[] = [];
  const timed: Sentence[] = [];
  let offset = 0;
  let si = 0; // 원문 문장 인덱스(배치는 순서대로라 lockstep)

  for (let i = 0; i < batches.length; i++) {
    const part = path.join(outDir, `.part-${i}.mp3`);
    const aligned = await synthesizeBatch(batches[i], part);
    parts.push(part);
    for (const s of aligned) {
      // 타이밍은 합성본 기준으로 잡되, 저장 텍스트는 원문(하이라이트 매칭용)
      timed.push({ text: sentences[si], start: s.start + offset, end: s.end + offset });
      si++;
    }
    offset += mp3Duration(part); // 실제 길이로 보정(단어 종료 시각보다 정확)
  }

  const finalPath = path.join(outDir, 'audio.mp3');
  if (parts.length === 1) {
    fs.renameSync(parts[0], finalPath);
  } else {
    const listFile = path.join(outDir, '.concat.txt');
    fs.writeFileSync(listFile, parts.map((p) => `file '${path.resolve(p)}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', finalPath], {
      stdio: 'ignore',
    });
    fs.rmSync(listFile);
    for (const p of parts) fs.rmSync(p);
  }

  fs.writeFileSync(path.join(outDir, 'audio.json'), JSON.stringify(timed));

  console.log(
    `ok: ${slug}  (${sentences.length} sentences, ${batches.length} batches, ${offset.toFixed(1)}s)`,
  );
}

const hasAudio = (slug: string) =>
  fs.existsSync(path.join(OUT_ROOT, slug, 'audio.mp3'));

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const slug = args.find((a) => !a.startsWith('--'));

  let files = postFiles();
  if (slug) {
    files = files.filter((f) => slugOf(f) === slug);
    if (files.length === 0) {
      console.error(`no post for slug: ${slug}`);
      process.exit(1);
    }
  } else if (!all) {
    // 기본: 오디오가 아직 없는 글만 생성(증분). 전체 재생성은 --all.
    files = files.filter((f) => !hasAudio(slugOf(f)));
    if (files.length === 0) {
      console.log('오디오 없는 글이 없습니다. 전체를 다시 만들려면 --all 을 붙이세요.');
      return;
    }
  }
  for (const file of files) {
    await generate(file);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
