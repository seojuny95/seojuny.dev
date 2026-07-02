import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { defaultLocale, type Locale } from './i18n';

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags: string[];
  content: string;
  readingTime: number;
};

export type SearchEntry = Pick<Post, 'slug' | 'title' | 'summary' | 'tags'>;

type RawPost = Post & { draft: boolean };

const KOREAN_CPM = 500;
const LATIN_WPM = 220;
const CODE_WPM = 100;
const SECONDS_PER_IMAGE = 12;

const DATE_FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  ko: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
};

export function formatDate(isoDate: string, locale: Locale = defaultLocale): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return DATE_FORMATTERS[locale].format(d);
}

export function readingTime(content: string): number {
  const codeWords = (content.match(/```[\s\S]*?```/g) ?? [])
    .map((block) => block.replace(/^```[^\n]*\n?/, '').replace(/```$/, ''))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const withoutCode = content.replace(/```[\s\S]*?```/g, ' ');
  const imageCount = (withoutCode.match(/!\[[^\]]*\]\([^)]*\)/g) ?? []).length;
  const stripped = withoutCode
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/`([^`]*)`/g, ' $1 ')
    .replace(/<[^>]+>/g, ' ');
  const korean = (stripped.match(/[가-힣]/g) ?? []).length;
  const latin = stripped
    .replace(/[가-힣]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  const textMinutes = korean / KOREAN_CPM + latin / LATIN_WPM;
  const codeMinutes = codeWords / CODE_WPM;
  const imageMinutes = (imageCount * SECONDS_PER_IMAGE) / 60;
  return Math.max(1, Math.ceil(textMinutes + codeMinutes + imageMinutes));
}

function postsDir(locale: Locale): string {
  return locale === 'ko'
    ? path.join(process.cwd(), 'content', 'posts')
    : path.join(process.cwd(), 'content', locale, 'posts');
}

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.mdx?$/, '');
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function readAllRaw(locale: Locale): RawPost[] {
  const dir = postsDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f));
  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf8');
    const { data, content } = matter(raw);
    if (!data.title || !data.date) {
      throw new Error(`Missing required frontmatter (title/date) in ${filename}`);
    }
    return {
      slug: slugFromFilename(filename),
      title: String(data.title),
      date: String(data.date),
      summary: data.summary ? String(data.summary) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      content,
      readingTime: readingTime(content),
      draft: Boolean(data.draft),
    };
  });
}

export function getAllPosts(locale: Locale = defaultLocale): Post[] {
  return readAllRaw(locale)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ draft: _draft, ...post }) => post);
}

export function getPostBySlug(slug: string, locale: Locale = defaultLocale): Post {
  const post = getAllPosts(locale).find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug} (${locale})`);
  return post;
}

export function hasPost(slug: string, locale: Locale): boolean {
  return getAllPosts(locale).some((p) => p.slug === slug);
}

export function getAdjacentPosts(
  slug: string,
  locale: Locale = defaultLocale,
): { prev?: Post; next?: Post } {
  const posts = getAllPosts(locale);
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? posts[i - 1] : undefined,
    next: i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

export function getSearchIndex(locale: Locale = defaultLocale): SearchEntry[] {
  return getAllPosts(locale).map(({ slug, title, summary, tags }) => ({
    slug,
    title,
    summary,
    tags,
  }));
}
