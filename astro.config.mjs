import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import githubLightHighContrast from "shiki/themes/github-light-high-contrast.mjs";

import { defaultLocale, localeLanguageTags, site } from "./src/config.ts";

const accessibleCodeTheme = {
  ...githubLightHighContrast,
  name: "github-light-high-contrast-aa",
  tokenColors: (githubLightHighContrast.tokenColors ?? []).map((token) => {
    const scopes = Array.isArray(token.scope)
      ? token.scope
      : token.scope
        ? [token.scope]
        : [];

    return scopes.some((scope) => scope.includes("comment"))
      ? {
          ...token,
          settings: { ...token.settings, foreground: "#586573" },
        }
      : token;
  }),
};

export default defineConfig({
  site: site.url.href,
  output: "static",
  trailingSlash: "never",
  integrations: [
    react(),
    mdx(),
    sitemap({
      customPages: [site.url.href],
      i18n: {
        defaultLocale,
        locales: localeLanguageTags,
      },
      namespaces: { news: false, video: false },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [
        rehypeUnwrapImages,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: {
              className: ["heading-anchor"],
              ariaHidden: "true",
              tabIndex: -1,
            },
            content: { type: "text", value: "#" },
          },
        ],
        [
          rehypePrettyCode,
          { theme: accessibleCodeTheme, keepBackground: false },
        ],
        rehypeKatex,
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel({ webAnalytics: { enabled: true } }),
});
