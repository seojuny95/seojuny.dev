import { getAllPosts } from "@/lib/posts";
import { localePath, ui, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/metadata";

export function buildLlmsTxt(locale: Locale): string {
  const posts = getAllPosts(locale);

  const lines = [
    "# seojuny.dev",
    "",
    `> ${ui[locale].siteDescription}`,
    "",
    "## Posts",
    "",
    ...posts.map((post) => {
      const url = `${SITE_URL}${localePath(locale, `/${post.slug}`)}`;
      return post.summary
        ? `- [${post.title}](${url}): ${post.summary}`
        : `- [${post.title}](${url})`;
    }),
    "",
    "## About",
    "",
    `- [About](${SITE_URL}${localePath(locale, "/about")}): ${ui[locale].aboutLlmsLine}`,
    "",
  ];

  return lines.join("\n");
}
