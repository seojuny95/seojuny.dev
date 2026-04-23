import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: 'Archive — codydev.blog' };

export default function PostsPage() {
  const posts = getAllPosts();
  const byYear = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  let runningIndex = 0;

  return (
    <section>
      <header className="mb-12">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Archive
        </p>
        <h1 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.015em]">
          All posts
        </h1>
        <p className="text-[14px] text-[var(--muted)] mt-2 tabular-nums">
          {posts.length}편
        </p>
      </header>

      {years.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">글이 아직 없습니다.</p>
      ) : (
        <div className="stagger flex flex-col gap-10">
          {years.map((year) => {
            const list = byYear.get(year)!;
            return (
              <section
                key={year}
                style={{ '--i': runningIndex++ } as CSSProperties}
                className="flex flex-col sm:flex-row sm:gap-8"
              >
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[var(--fg)] mb-3 sm:mb-0 sm:w-[96px] shrink-0 tabular-nums tracking-[-0.01em] sm:pt-[3px]">
                  {year}
                </h2>
                <ul className="flex-1 list-none p-0 m-0">
                  {list.map((p) => (
                    <li
                      key={p.slug}
                      className="group border-t border-[var(--rule)] first:border-t-0"
                    >
                      <Link
                        href={`/posts/${p.slug}`}
                        className="row-nudge flex items-baseline gap-4 py-2.5"
                      >
                        <time className="text-[13px] text-[var(--muted)] w-[48px] shrink-0 tabular-nums tracking-wide">
                          {p.date.slice(5)}
                        </time>
                        <span className="flex-1 min-w-0 leading-snug truncate">
                          <span className="link">{p.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
