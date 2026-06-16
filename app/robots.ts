import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

// '*'로 이미 전체 허용되지만, 주요 AI 크롤러를 명시해 차단하지 않음을 분명히 한다.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
