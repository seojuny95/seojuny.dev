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
};

export type TagInfo = { tag: string; count: number };
export type SearchEntry = Pick<Post, 'slug' | 'title' | 'summary' | 'tags'>;

type RawPost = Post & { draft: boolean };

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

export function getAllTags(): TagInfo[] {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
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
