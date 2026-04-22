import { notFound } from 'next/navigation';
import { getAllTags, getPostsByTag } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)} — seojun.blog` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">#{tag}</h1>
      <PostList posts={posts} />
    </section>
  );
}
