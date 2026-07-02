import fs from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getPostBySlug, formatDate } from '@/lib/posts';
import { ui, type Locale } from '@/lib/i18n';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const PRETENDARD_DIR = 'node_modules/pretendard/dist/public/static';

const ogSubtitle: Record<Locale, string> = {
  ko: '소프트웨어 개발과 AI 학습 기록',
  en: 'Notes on software development and AI learning',
};

export async function renderSiteOgImage(locale: Locale): Promise<ImageResponse> {
  const [bold, regular] = await Promise.all([
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Bold.otf')),
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Regular.otf')),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafaf9',
          color: '#171717',
          fontFamily: 'Pretendard',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: '-0.025em',
          }}
        >
          <span>seojuny</span>
          <span style={{ color: '#8a8a85', fontWeight: 400 }}>.dev</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            color: '#8a8a85',
            letterSpacing: '-0.01em',
          }}
        >
          {ogSubtitle[locale]}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
        { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
      ],
    },
  );
}

export async function renderPostOgImage(locale: Locale, slug: string): Promise<ImageResponse> {
  const post = getPostBySlug(slug, locale);

  const [bold, regular] = await Promise.all([
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Bold.otf')),
    fs.readFile(path.join(process.cwd(), PRETENDARD_DIR, 'Pretendard-Regular.otf')),
  ]);

  const metaParts = [
    formatDate(post.date, locale),
    ...post.tags.map((t) => `#${t}`),
    ui[locale].minRead(post.readingTime),
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
      ...ogSize,
      fonts: [
        { name: 'Pretendard', data: bold, weight: 700, style: 'normal' },
        { name: 'Pretendard', data: regular, weight: 400, style: 'normal' },
      ],
    },
  );
}
