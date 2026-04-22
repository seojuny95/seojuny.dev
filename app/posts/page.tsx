import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: 'Posts — codydev.blog' };

export default function PostsPage() {
  const posts = getAllPosts();
  const byYear = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <section>
      <header className="mb-12">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Archive
        </p>
        <h1 className="text-[22px] leading-[1.4] tracking-[-0.01em]">Posts</h1>
      </header>
      {years.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">글이 아직 없습니다.</p>
      ) : (
        years.map((year, yi) => (
          <div key={year} className="mb-12">
            <h2 className="text-[12px] text-[var(--muted)] mb-2 tabular-nums tracking-[0.14em]">
              {year}
            </h2>
            <ul className="stagger list-none p-0 m-0">
              {byYear.get(year)!.map((p, i) => (
                <li
                  key={p.slug}
                  style={{ '--i': yi * 3 + i } as CSSProperties}
                  className="group border-t border-[var(--rule)] first:border-t-0"
                >
                  <Link
                    href={`/posts/${p.slug}`}
                    className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:gap-5"
                  >
                    <time className="text-[11px] sm:text-[12px] text-[var(--muted)] sm:w-[72px] shrink-0 tabular-nums tracking-wide transition-colors duration-300 group-hover:text-[var(--fg)]">
                      {p.date}
                    </time>
                    <span className="flex-1 leading-snug row-nudge inline-block">
                      <span className="link">{p.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
