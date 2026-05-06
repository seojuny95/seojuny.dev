import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date ?? new Date().toISOString();
  const aboutMtime = fs
    .statSync(path.join(process.cwd(), 'content', 'about.mdx'))
    .mtime.toISOString();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: latest,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: aboutMtime,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
