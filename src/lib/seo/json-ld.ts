import { localeLanguageTags, site } from "../../config";
import type { Locale } from "../../i18n/locales";
import { messages } from "../../i18n/messages";
import { localePath } from "../../i18n/routing";
import type { Post } from "../content/posts";

export function buildSiteJsonLd(locale: Locale): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: new URL(localePath(locale), site.url).href,
      name: site.name,
      description: messages[locale].siteDescription,
      inLanguage: localeLanguageTags[locale],
      author: { "@type": "Person", name: "seojuny", url: site.url.href },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "seojuny",
      url: site.url.href,
      jobTitle: locale === "ko" ? "소프트웨어 개발자" : "Software Developer",
      sameAs: [
        "https://github.com/seojuny95",
        "https://www.linkedin.com/in/seoj95/",
      ],
    },
  ];
}

export function buildPostJsonLd(post: Post, locale: Locale): object {
  const url = new URL(localePath(locale, `/${post.slug}`), site.url).href;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.data.title,
    description: post.data.summary,
    datePublished: post.data.date,
    dateModified: post.data.date,
    inLanguage: localeLanguageTags[locale],
    keywords: post.data.tags,
    mainEntityOfPage: url,
    url,
    image: `${url}/opengraph-image`,
    author: {
      "@type": "Person",
      name: "seojuny",
      url: new URL(localePath(locale, "/about"), site.url).href,
      sameAs: [
        "https://github.com/seojuny95",
        "https://www.linkedin.com/in/seoj95/",
      ],
    },
    publisher: { "@type": "Person", name: "seojuny", url: site.url.href },
  };
}
