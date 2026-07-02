import { NextResponse, type NextRequest } from 'next/server';
import { prefersEnglish } from '@/lib/accept-language';

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get('locale')?.value;
  if (cookie === 'ko') return;
  if (
    cookie === 'en' ||
    (!cookie && prefersEnglish(request.headers.get('accept-language') ?? ''))
  ) {
    return NextResponse.redirect(new URL('/en', request.url), 307);
  }
}

export const config = { matcher: '/' };
