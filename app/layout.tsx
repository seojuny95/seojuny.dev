import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchModal } from '@/components/SearchModal';
import { getSearchIndex } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'seojuny.dev',
  description: '개인 블로그',
  alternates: {
    types: {
      'application/atom+xml': '/feed.xml',
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
