import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchModal } from '@/components/SearchModal';
import { getSearchIndex } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'codydev.blog',
  description: '개인 블로그',
  alternates: {
    types: {
      'application/atom+xml': '/feed.xml',
    },
  },
};

const themeInit = `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(!s&&p);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = getSearchIndex();
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script>{themeInit}</script>
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="mx-auto w-full max-w-[680px] px-4 sm:px-5 flex-1 pt-10 sm:pt-14">
            {children}
          </main>
          <Footer />
        </div>
        <SearchModal index={searchIndex} />
      </body>
    </html>
  );
}
