import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Post } from '@/lib/posts';

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
          <Link href={`/posts/${p.slug}`} className="block py-4">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-5">
              <time className="text-[11px] sm:text-[12px] text-[var(--muted)] sm:w-[72px] shrink-0 tabular-nums tracking-wide transition-colors duration-300 group-hover:text-[var(--fg)]">
                {p.date}
              </time>
              <span className="flex-1 leading-snug row-nudge inline-block">
                <span className="link">{p.title}</span>
              </span>
            </div>
            {p.summary ? (
              <p className="text-[13px] sm:text-[13.5px] text-[var(--muted)] mt-1.5 sm:ml-[92px] leading-relaxed row-nudge">
                {p.summary}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
