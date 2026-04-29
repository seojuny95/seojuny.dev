import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Post } from '@/lib/posts';
import { formatDate } from '@/lib/posts';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-[var(--muted)]">글이 아직 없습니다.</p>;
  }
  return (
    <ul className="stagger list-none p-0 m-0 flex flex-col">
      {posts.map((p, i) => (
        <li
          key={p.slug}
          style={{ '--i': i } as CSSProperties}
          className="group border-t border-[var(--rule)] first:border-t-0"
        >
          <Link href={`/posts/${p.slug}`} className="block py-4 row-nudge">
            <div className="font-medium leading-snug">
              <span className="link">{p.title}</span>
            </div>
            <div className="flex items-baseline gap-2 text-[13px] text-[var(--muted)] mt-1 tabular-nums tracking-wide transition-colors duration-300 group-hover:text-[var(--fg)]">
              <time dateTime={p.date}>{formatDate(p.date)}</time>
              <span aria-hidden className="opacity-60">·</span>
              <span>{p.readingTime}분</span>
            </div>
            {p.summary ? (
              <p className="text-[14px] text-[var(--muted)] mt-1.5 leading-relaxed">
                {p.summary}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
