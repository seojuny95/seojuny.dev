import type { Metadata } from 'next';
import { Noto_Serif_KR } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const notoSerifKr = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-noto-serif-kr',
});

export const metadata: Metadata = {
  title: 'seojun.blog',
  description: '개인 블로그',
  alternates: {
    types: {
      'application/atom+xml': '/feed.xml',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning className={notoSerifKr.variable}>
      <body>
        <Providers>
          <div className="mx-auto max-w-[640px] px-4 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
