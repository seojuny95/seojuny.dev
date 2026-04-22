import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts } from '@/lib/posts';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} — seojun.blog`,
      description: post.summary,
    };
  } catch {
    return {};
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }
  const { prev, next } = getAdjacentPosts(slug);

  return (
    <article>
      <Link
        href="/posts"
        className="ui-sans text-sm text-[var(--muted)] no-underline"
      >
        ← 목록으로
      </Link>

      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="ui-sans text-sm text-[var(--muted)] mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <time>{post.date}</time>
          {post.tags.length > 0 ? (
            <span className="flex gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}`}
                  className="no-underline"
                >
                  #{t}
                </Link>
              ))}
            </span>
          ) : null}
        </div>
      </header>

      <div className="prose-blog">
        <MDXRemote source={post.content} />
      </div>

      <hr className="my-12" />

      <nav className="ui-sans text-sm flex justify-between gap-4">
        <div className="min-w-0">
          {next ? (
            <Link href={`/posts/${next.slug}`} className="no-underline">
              <span className="block text-[var(--muted)]">← 이전 글</span>
              <span className="truncate block">{next.title}</span>
            </Link>
          ) : null}
        </div>
        <div className="min-w-0 text-right">
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="no-underline">
              <span className="block text-[var(--muted)]">다음 글 →</span>
              <span className="truncate block">{prev.title}</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
