import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";
import { localePath, ui, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/metadata";

export function buildFeed(locale: Locale): string {
  const base = `${SITE_URL}${localePath(locale) === "/" ? "" : localePath(locale)}`;
  const feed = new Feed({
    title: "seojuny.dev",
    description: ui[locale].siteDescription,
    id: base || SITE_URL,
    link: base || SITE_URL,
    language: locale,
    copyright: `© ${new Date().getFullYear()} seojuny`,
    feedLinks: { atom: `${SITE_URL}${localePath(locale, "/feed.xml")}` },
  });
  for (const post of getAllPosts(locale)) {
    const url = `${SITE_URL}${localePath(locale, `/${post.slug}`)}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary,
      date: new Date(post.date),
    });
  }
  return feed.atom1();
}
