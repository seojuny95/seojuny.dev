import { Feed } from 'feed';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

export function GET() {
  const feed = new Feed({
    title: 'seojuny.dev',
    description: '개인 블로그',
    id: SITE_URL,
    link: SITE_URL,
    language: 'ko',
    copyright: `© ${new Date().getFullYear()} seojuny`,
    feedLinks: { atom: `${SITE_URL}/feed.xml` },
  });

  for (const post of getAllPosts()) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/${post.slug}`,
      link: `${SITE_URL}/${post.slug}`,
      description: post.summary,
      date: new Date(post.date),
    });
  }

  return new Response(feed.atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
