// 글마다 Edge TTS로 음성(audio.mp3)과 문장별 타이밍(audio.json)을 생성한다.
// 작성/수정 시 로컬에서 실행하고 결과물을 커밋한다(빌드는 네트워크에 의존하지 않음).
//
//   pnpm generate:audio              # 오디오 없는 글만 (증분 — 새 글 추가 시)
//   pnpm generate:audio --all        # 전체 재생성 (글로사리·보이스·추출 로직 변경 시)
//   pnpm generate:audio what-is-rag  # 특정 글만 (본문 수정 시)
//
// 산출물: public/posts/<slug>/audio.mp3, public/posts/<slug>/audio.json
// 순수 텍스트 로직(추출·발음교정·정렬)은 lib/audio-text.ts (테스트 대상).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';
import { EdgeTTS, Constants } from '@andresaya/edge-tts';
import { splitIntoChunks } from '../lib/speech';
import {
  mdxToReadableText,
  toSpeechText,
  alignWords,
  batchSentences,
  slugOf,
  type Sentence,
} from '../lib/audio-text';

const VOICE = 'ko-KR-HyunsuMultilingualNeural';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUT_ROOT = path.join(process.cwd(), 'public', 'posts');

function postFiles(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => path.join(POSTS_DIR, f));
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
