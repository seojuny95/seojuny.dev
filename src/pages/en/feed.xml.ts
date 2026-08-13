import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import { localeLanguageTags, site as siteConfig } from "../../config";
import { messages } from "../../i18n/messages";
import { getAllPosts } from "../../lib/content/posts";

export const GET: APIRoute = async ({ site: astroSite }) => {
  const posts = await getAllPosts("en");

  return rss({
    title: siteConfig.name,
    description: messages.en.siteDescription,
    site: new URL("/en", astroSite ?? siteConfig.url),
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: new Date(`${post.data.date}T00:00:00Z`),
      link: `/en/${post.slug}`,
    })),
    customData: `<language>${localeLanguageTags.en}</language>`,
  });
};
