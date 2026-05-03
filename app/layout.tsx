import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchModal } from '@/components/SearchModal';
import { getSearchIndex } from '@/lib/posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'seojuny.dev',
    template: '%s — seojuny.dev',
  },
  description: '프론트엔드 개발과 학습 기록을 남기는 seojuny의 개인 블로그.',
  alternates: {
    canonical: '/',
    types: {
      'application/atom+xml': '/feed.xml',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'seojuny.dev',
    locale: 'ko_KR',
    url: '/',
    title: 'seojuny.dev',
    description: '프론트엔드 개발과 학습 기록을 남기는 seojuny의 개인 블로그.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'seojuny.dev',
    description: '프론트엔드 개발과 학습 기록을 남기는 seojuny의 개인 블로그.',
  },
  verification: {
    other: {
      'naver-site-verification': '517ef8cf614d57620560dff23bd5fa37dcab4ba7',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();
  return (
    <html lang="ko">
      <body>
        <a href="#main" className="skip-link">본문으로 건너뛰기</a>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-[680px] px-4 sm:px-5 flex-1 pt-10 sm:pt-14 outline-none"
          >
            {children}
          </main>
          <Footer />
        </div>
        <SearchModal index={searchIndex} />
        <Analytics />
      </body>
    </html>
  );
}
