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
  return { title: `#${decodeURIComponent(tag)} — codydev.blog` };
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
      <header className="mb-12">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Tag
        </p>
        <h1 className="text-[22px] leading-[1.4] tracking-[-0.01em]">
          #{tag}
        </h1>
      </header>
      <PostList posts={posts} />
    </section>
  );
}
