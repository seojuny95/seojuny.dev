import type { Metadata } from 'next';
import './globals.css';
import { pretendard } from './fonts';
import { NotFoundView } from '@/components/NotFoundView';

export const metadata: Metadata = {
  title: '404 — seojuny.dev',
};

export default function GlobalNotFound() {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <main className="mx-auto w-full max-w-[680px] px-4 sm:px-5 pt-10 sm:pt-14">
          <NotFoundView locale="ko" />
        </main>
      </body>
    </html>
  );
}
