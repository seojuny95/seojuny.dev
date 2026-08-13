import type { Locale } from "../i18n/locales";
import { localePath } from "../i18n/routing";
import { messages } from "../i18n/messages";
import { site } from "../config";
import { getAllPosts } from "./content/posts";

export async function buildLlmsTxt(locale: Locale): Promise<string> {
  const posts = await getAllPosts(locale);
  const aboutDescription =
    locale === "ko"
      ? "seojuny 소개와 GitHub·LinkedIn 링크"
      : "About seojuny with GitHub and LinkedIn links";

  return [
    `# ${site.name}`,
    "",
    `> ${messages[locale].siteDescription}`,
    "",
    "## Posts",
    "",
    ...posts.map((post) => {
      const url = new URL(localePath(locale, `/${post.slug}`), site.url).href;
      return post.data.summary
        ? `- [${post.data.title}](${url}): ${post.data.summary}`
        : `- [${post.data.title}](${url})`;
    }),
    "",
    "## About",
    "",
    `- [About](${new URL(localePath(locale, "/about"), site.url).href}): ${aboutDescription}`,
    "",
  ].join("\n");
}
