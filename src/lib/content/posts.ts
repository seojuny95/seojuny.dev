import { getCollection, type CollectionEntry } from "astro:content";

import { defaultLocale, isLocale, type Locale } from "../../i18n/locales";
import { readingTime } from "./reading-time";

export { formatDate } from "./date";

export type PostEntry = CollectionEntry<"posts">;

export type Post = PostEntry & {
  locale: Locale;
  readingTime: number;
  slug: string;
};

export type SearchEntry = Pick<Post, "slug"> &
  Pick<Post["data"], "summary" | "tags" | "title">;

function parsePostId(id: string): { locale: Locale; slug: string } {
  const [locale, ...slugParts] = id.split("/");

  if (!isLocale(locale) || slugParts.length === 0) {
    throw new Error(`Invalid post ID: ${id}`);
  }

  return { locale, slug: slugParts.join("/") };
}

function toPost(entry: PostEntry): Post {
  const { locale, slug } = parsePostId(entry.id);

  return {
    ...entry,
    locale,
    readingTime: readingTime(entry.body ?? ""),
    slug,
  };
}

export async function getAllPosts(
  locale: Locale = defaultLocale,
): Promise<Post[]> {
  const entries = await getCollection(
    "posts",
    ({ data, id }) => !data.draft && id.startsWith(`${locale}/`),
  );

  return entries
    .map(toPost)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export async function getPostBySlug(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<Post> {
  const post = (await getAllPosts(locale)).find((entry) => entry.slug === slug);

  if (!post) {
    throw new Error(`Post not found: ${slug} (${locale})`);
  }

  return post;
}

export async function hasPost(slug: string, locale: Locale): Promise<boolean> {
  return (await getAllPosts(locale)).some((entry) => entry.slug === slug);
}

export async function getAdjacentPosts(
  slug: string,
  locale: Locale = defaultLocale,
): Promise<{ next?: Post; prev?: Post }> {
  const posts = await getAllPosts(locale);
  const index = posts.findIndex((entry) => entry.slug === slug);

  if (index === -1) return {};

  return {
    prev: index > 0 ? posts[index - 1] : undefined,
    next: index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}

export async function getSearchIndex(
  locale: Locale = defaultLocale,
): Promise<SearchEntry[]> {
  return (await getAllPosts(locale)).map(({ data, slug }) => ({
    slug,
    title: data.title,
    summary: data.summary,
    tags: data.tags,
  }));
}
