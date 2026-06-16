import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { pretendard } from './fonts';
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
  description:
    '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
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
    description:
    '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'seojuny.dev',
    description:
    '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
  },
  verification: {
    other: {
      'naver-site-verification': '517ef8cf614d57620560dff23bd5fa37dcab4ba7',
    },
  },
};

const siteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'seojuny.dev',
    description:
      '소프트웨어 개발자가 일하고 공부하며 남기는 기록.',
    inLanguage: 'ko-KR',
    author: { '@type': 'Person', name: 'seojuny', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'seojuny',
    url: SITE_URL,
    jobTitle: '소프트웨어 개발자',
    sameAs: [
      'https://github.com/seojuny95',
      'https://www.linkedin.com/in/seoj95/',
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <script type="application/ld+json">{JSON.stringify(siteJsonLd)}</script>
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
