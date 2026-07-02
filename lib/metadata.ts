import type { Metadata } from 'next';
import type { Post } from '@/lib/posts';
import { hasPost } from '@/lib/posts';
import { localePath, ui, type Locale } from '@/lib/i18n';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

function languageAlternates(path: string, slug?: string) {
  const entries: Record<string, string> = {};
  if (!slug || hasPost(slug, 'ko')) entries.ko = localePath('ko', path);
  if (!slug || hasPost(slug, 'en')) entries.en = localePath('en', path);
  if (entries.ko) entries['x-default'] = entries.ko;
  return entries;
}

export function buildSiteMetadata(locale: Locale): Metadata {
  const t = ui[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'seojuny.dev', template: '%s — seojuny.dev' },
    description: t.siteDescription,
    alternates: {
      canonical: localePath(locale),
      languages: languageAlternates('/'),
      types: { 'application/atom+xml': localePath(locale, '/feed.xml') },
    },
    openGraph: {
      type: 'website',
      siteName: 'seojuny.dev',
      locale: t.ogLocale,
      url: localePath(locale),
      title: 'seojuny.dev',
      description: t.siteDescription,
    },
    twitter: { card: 'summary_large_image', title: 'seojuny.dev', description: t.siteDescription },
    ...(locale === 'ko'
      ? {
          verification: {
            other: { 'naver-site-verification': '517ef8cf614d57620560dff23bd5fa37dcab4ba7' },
          },
        }
      : {}),
  };
}

export function buildPostMetadata(post: Post, locale: Locale): Metadata {
  const path = `/${post.slug}`;
  const url = localePath(locale, path);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url, languages: languageAlternates(path, post.slug) },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.summary,
      siteName: 'seojuny.dev',
      locale: ui[locale].ogLocale,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  };
}

export function buildSiteJsonLd(locale: Locale): object[] {
  const t = ui[locale];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: `${SITE_URL}${localePath(locale)}`,
      name: 'seojuny.dev',
      description: t.siteDescription,
      inLanguage: t.bcp47,
      author: { '@type': 'Person', name: 'seojuny', url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'seojuny',
      url: SITE_URL,
      jobTitle: t.jobTitle,
      sameAs: ['https://github.com/seojuny95', 'https://www.linkedin.com/in/seoj95/'],
    },
  ];
}

export function buildPostJsonLd(post: Post, locale: Locale): object {
  const url = `${SITE_URL}${localePath(locale, `/${post.slug}`)}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: ui[locale].bcp47,
    keywords: post.tags,
    mainEntityOfPage: url,
    url,
    image: `${url}/opengraph-image`,
    author: {
      '@type': 'Person',
      name: 'seojuny',
      url: `${SITE_URL}${localePath(locale, '/about')}`,
      sameAs: ['https://github.com/seojuny95', 'https://www.linkedin.com/in/seoj95/'],
    },
    publisher: { '@type': 'Person', name: 'seojuny', url: SITE_URL },
  };
}
