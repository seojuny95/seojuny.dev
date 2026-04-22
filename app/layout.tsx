import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script>{themeInit}</script>
      </head>
      <body>
        <div className="mx-auto max-w-[620px] px-4 sm:px-5 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
