import fs from 'node:fs';
import path from 'node:path';
import type { ComponentPropsWithoutRef } from 'react';
import type { MDXRemoteProps } from 'next-mdx-remote/rsc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts, formatDate } from '@/lib/posts';
import { mdxOptions } from '@/lib/mdx';
import { localePath, ui, type Locale } from '@/lib/i18n';
import { buildPostJsonLd } from '@/lib/metadata';
import { ArticleActions } from '@/components/ArticleActions';
import { CodeBlock } from '@/components/CodeBlock';
import { Comments } from '@/components/Comments';
import { PostImage } from '@/components/PostImage';
import { ReadingProgress } from '@/components/ReadingProgress';
import { Toc } from '@/components/Toc';

const mdxComponents = {
  img: PostImage,
  pre: CodeBlock,
  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
} as MDXRemoteProps['components'];

export function postStaticParams(locale: Locale) {
  return getAllPosts(locale).map((p) => ({ slug: p.slug }));
}

export function PostView({ locale, slug }: { locale: Locale; slug: string }) {
  const t = ui[locale];
  let post;
  try {
    post = getPostBySlug(slug, locale);
  } catch {
    notFound();
  }
  const { prev, next } = getAdjacentPosts(slug, locale);

  const audioRel =
    locale === 'ko' ? `posts/${slug}/audio.mp3` : `posts/${slug}/${locale}/audio.mp3`;
  const hasAudio = fs.existsSync(path.join(process.cwd(), 'public', audioRel));
  const audioSrc = hasAudio ? `/${audioRel}` : undefined;
  const timingSrc = hasAudio ? `/${audioRel.replace(/\.mp3$/, '.json')}` : undefined;

  return (
    <article>
      <script type="application/ld+json">
        {JSON.stringify(buildPostJsonLd(post, locale))}
      </script>
      <ReadingProgress />
      <Toc locale={locale} />
      <nav aria-label={t.pageNavAria}>
        <Link
          href={localePath(locale)}
          className="inline-block text-[14px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
        >
          {t.backToPosts}
        </Link>
      </nav>

      <header className="mt-8 mb-10 sm:mt-10 sm:mb-12">
        <h1 className="text-[30px] sm:text-[36px] font-semibold leading-[1.2] tracking-[-0.018em]">
          {post.title}
        </h1>
        <div className="text-[13px] text-[var(--muted)] mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums tracking-wide">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span aria-hidden className="opacity-60">·</span>
          <span>{t.minRead(post.readingTime)}</span>
          {post.tags.length > 0 ? (
            <>
              <span aria-hidden className="opacity-60">·</span>
              <ul aria-label={t.tagsAria} className="flex gap-2.5 list-none p-0 m-0">
                {post.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </header>

      <ArticleActions audioSrc={audioSrc} timingSrc={timingSrc} locale={locale} />

      <div className="prose-blog">
        <MDXRemote source={post.content} components={mdxComponents} options={mdxOptions} />
      </div>

      <hr className="mt-16 mb-8 sm:mt-20 sm:mb-10" />

      <nav
        aria-label={t.adjacentAria}
        className="text-[14px] flex flex-col gap-6 sm:flex-row sm:justify-between"
      >
        {next ? (
          <Link
            href={localePath(locale, `/${next.slug}`)}
            className="group block min-w-0 sm:flex-1"
          >
            <span className="block text-[var(--muted)] text-[13px] uppercase tracking-[0.15em] mb-1">
              {t.prevPost}
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
            href={localePath(locale, `/${prev.slug}`)}
            className="group block min-w-0 sm:flex-1 sm:text-right"
          >
            <span className="block text-[var(--muted)] text-[13px] uppercase tracking-[0.15em] mb-1">
              {t.nextPost}
            </span>
            <span className="truncate block group-hover:text-[var(--muted)] transition-colors duration-300">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block sm:flex-1" />
        )}
      </nav>

      <section className="mt-16 sm:mt-20" aria-label={t.commentsAria}>
        <Comments locale={locale} />
      </section>
    </article>
  );
}
