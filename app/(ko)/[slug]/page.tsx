import type { Metadata } from 'next';
import { PostView, postStaticParams } from '@/components/pages/PostView';
import { buildPostMetadata } from '@/lib/metadata';
import { getPostBySlug } from '@/lib/posts';

export function generateStaticParams() {
  return postStaticParams('ko');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    return buildPostMetadata(getPostBySlug(slug, 'ko'), 'ko');
  } catch {
    return {};
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostView locale="ko" slug={slug} />;
}
