import fs from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'seojuny.dev';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PRETENDARD_DIR = 'node_modules/pretendard/dist/public/static';

export default async function Image() {
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
          소프트웨어 개발과 AI 학습 기록
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
