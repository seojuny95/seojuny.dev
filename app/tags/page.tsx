import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getAllTags } from '@/lib/posts';

export const metadata = { title: 'Tags — codydev.blog' };

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <section>
      <header className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Index
        </p>
        <h1 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.015em]">Tags</h1>
      </header>
      {tags.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">태그가 아직 없습니다.</p>
      ) : (
        <ul className="stagger list-none p-0 m-0 flex flex-wrap gap-x-5 gap-y-3 text-[15px]">
          {tags.map(({ tag, count }, i) => (
            <li key={tag} style={{ '--i': i } as CSSProperties}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className="link hover:text-[var(--muted)] transition-colors duration-300"
              >
                #{tag}
                <span className="text-[var(--muted)] text-[13px] ml-1 tabular-nums">
                  {count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
