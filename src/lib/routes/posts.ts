import type { GetStaticPaths } from "astro";

import { otherLocale, type Locale } from "../../i18n/locales";
import { localePath } from "../../i18n/routing";
import { getAllPosts, type Post } from "../content/posts";

export function buildPostStaticPathEntries(
  posts: Post[],
  alternatePosts: Post[],
  locale: Locale,
) {
  const alternateLocale = otherLocale(locale);
  const alternateSlugs = new Set(alternatePosts.map((post) => post.slug));

  return posts.map((post, index) => {
    const postPath = `/${post.slug}`;
    const alternatePaths = {
      [locale]: localePath(locale, postPath),
      ...(alternateSlugs.has(post.slug)
        ? { [alternateLocale]: localePath(alternateLocale, postPath) }
        : {}),
    };

    return {
      params: { slug: post.slug },
      props: {
        alternatePaths,
        post,
        prev: index > 0 ? posts[index - 1] : undefined,
        next: index < posts.length - 1 ? posts[index + 1] : undefined,
      },
    };
  });
}

export function createPostStaticPaths(locale: Locale) {
  return (async () => {
    const alternateLocale = otherLocale(locale);
    const [posts, alternatePosts] = await Promise.all([
      getAllPosts(locale),
      getAllPosts(alternateLocale),
    ]);

    return buildPostStaticPathEntries(posts, alternatePosts, locale);
  }) satisfies GetStaticPaths;
}
