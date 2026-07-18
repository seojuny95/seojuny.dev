import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { getAllPosts, hasPost } from "@/lib/posts";
import { locales, localePath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/metadata";

function alternatesFor(pathname: string, has: (locale: "ko" | "en") => boolean) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    if (has(locale)) languages[locale] = `${SITE_URL}${localePath(locale, pathname)}`;
  }
  return { languages };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    const latest = posts[0]?.date ?? new Date().toISOString();
    const aboutFile =
      locale === "ko"
        ? path.join(process.cwd(), "content", "about.mdx")
        : path.join(process.cwd(), "content", locale, "about.mdx");
    const aboutMtime = fs.statSync(aboutFile).mtime.toISOString();

    entries.push(
      {
        url: `${SITE_URL}${localePath(locale)}`,
        lastModified: latest,
        changeFrequency: "weekly",
        priority: locale === "ko" ? 1 : 0.9,
        alternates: alternatesFor("/", () => true),
      },
      {
        url: `${SITE_URL}${localePath(locale, "/about")}`,
        lastModified: aboutMtime,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: alternatesFor("/about", () => true),
      },
      ...posts.map((post) => ({
        url: `${SITE_URL}${localePath(locale, `/${post.slug}`)}`,
        lastModified: post.date,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: alternatesFor(`/${post.slug}`, (l) => hasPost(post.slug, l)),
      }))
    );
  }
  return entries;
}
