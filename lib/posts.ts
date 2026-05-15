import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

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
const SECONDS_PER_IMAGE = 12;

const DATE_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return DATE_FORMATTER.format(d);
}

export function readingTime(content: string): number {
  const imageCount = (content.match(/!\[[^\]]*\]\([^)]*\)/g) ?? []).length;
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const korean = (stripped.match(/[가-힣]/g) ?? []).length;
  const latin = stripped
    .replace(/[가-힣]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  const textMinutes = korean / KOREAN_CPM + latin / LATIN_WPM;
  const imageMinutes = (imageCount * SECONDS_PER_IMAGE) / 60;
  return Math.max(1, Math.ceil(textMinutes + imageMinutes));
}

function postsDir(): string {
  return path.join(process.cwd(), 'content', 'posts');
}

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.mdx?$/, '');
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function readAllRaw(): RawPost[] {
  const dir = postsDir();
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

export function getAllPosts(): Post[] {
  return readAllRaw()
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ draft: _draft, ...post }) => post);
}

export function getPostBySlug(slug: string): Post {
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) throw new Error(`Post not found: ${slug}`);
  return post;
}

export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? posts[i - 1] : undefined,
    next: i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

export function getSearchIndex(): SearchEntry[] {
  return getAllPosts().map(({ slug, title, summary, tags }) => ({
    slug,
    title,
    summary,
    tags,
  }));
}
