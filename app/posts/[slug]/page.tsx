import type { Metadata } from 'next';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts, formatDate } from '@/lib/posts';
import { Comments } from '@/components/Comments';
import { PostImage } from '@/components/PostImage';

const mdxComponents = { img: PostImage } as MDXRemoteProps['components'];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seojuny.dev';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    const url = `/posts/${slug}`;
    return {
      title: post.title,
      description: post.summary,
      alternates: { canonical: url },
      openGraph: {
        type: 'article',
        url,
        title: post.title,
        description: post.summary,
        siteName: 'seojuny.dev',
        locale: 'ko_KR',
        publishedTime: post.date,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.summary,
      },
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

  const url = `${SITE_URL}/posts/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    inLanguage: 'ko-KR',
    keywords: post.tags,
    mainEntityOfPage: url,
    url,
    image: `${url}/opengraph-image`,
    author: {
      '@type': 'Person',
      name: 'seojuny',
      url: `${SITE_URL}/about`,
    },
  };

  return (
    <article>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <nav aria-label="페이지 이동">
        <Link
          href="/posts"
          className="inline-block text-[14px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
        >
          ← Posts
        </Link>
      </nav>

      <header className="mt-8 mb-10 sm:mt-10 sm:mb-12">
        <h1 className="text-[30px] sm:text-[36px] font-semibold leading-[1.2] tracking-[-0.018em]">
          {post.title}
        </h1>
        <div className="text-[13px] text-[var(--muted)] mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums tracking-wide">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden className="opacity-60">·</span>
          <span>{post.readingTime}분</span>
          {post.tags.length > 0 ? (
            <>
              <span aria-hidden className="opacity-60">·</span>
              <ul aria-label="태그" className="flex gap-2.5 list-none p-0 m-0">
                {post.tags.map((t) => (
                  <li key={t}>#{t}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </header>

      <div className="prose-blog">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      <hr className="mt-16 mb-8 sm:mt-20 sm:mb-10" />

      <nav
        aria-label="이전·다음 글"
        className="text-[14px] flex flex-col gap-6 sm:flex-row sm:justify-between"
      >
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="group block min-w-0 sm:flex-1"
          >
            <span className="block text-[var(--muted)] text-[13px] uppercase tracking-[0.15em] mb-1">
              ← 이전 글
            </span>
            <span className="truncate block group-hover:text-[var(--muted)] transition-colors duration-300">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block sm:flex-1" />
        )}
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="group block min-w-0 sm:flex-1 sm:text-right"
          >
            <span className="block text-[var(--muted)] text-[13px] uppercase tracking-[0.15em] mb-1">
              다음 글 →
            </span>
            <span className="truncate block group-hover:text-[var(--muted)] transition-colors duration-300">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block sm:flex-1" />
        )}
      </nav>

      <section className="mt-16 sm:mt-20" aria-label="댓글">
        <Comments />
      </section>
    </article>
  );
}
