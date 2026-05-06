import fs from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/posts';

export const alt = 'seojuny.dev';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PRETENDARD_DIR = 'node_modules/pretendard/dist/public/static';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const [bold, regular] = await Promise.all([
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Bold.otf')),
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Regular.otf')),
  ]);

  const metaParts = [
    formatDate(post.date),
    ...post.tags.map((t) => `#${t}`),
    `${post.readingTime}분`,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          background: '#fafaf9',
          color: '#171717',
          fontFamily: 'Pretendard',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.012em',
          }}
        >
          <span>seojuny</span>
          <span style={{ color: '#8a8a85', fontWeight: 400 }}>.dev</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.022em',
              color: '#171717',
            }}
          >
            {post.title}
          </div>
          {post.summary ? (
            <div
              style={{
                display: 'flex',
                fontSize: 32,
                lineHeight: 1.4,
                color: '#8a8a85',
                letterSpacing: '-0.01em',
              }}
            >
              {post.summary}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', height: 1, background: '#ececea' }} />
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#8a8a85',
              letterSpacing: '0.01em',
            }}
          >
            {metaParts.join('  ·  ')}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
        { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
      ],
    },
  );
}
