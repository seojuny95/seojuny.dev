import { renderPostOgImage, ogSize, ogContentType } from '@/lib/og-image';
import { postStaticParams } from '@/components/pages/PostView';

export const alt = 'seojuny.dev';
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return postStaticParams('ko');
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return renderPostOgImage('ko', (await params).slug);
}
