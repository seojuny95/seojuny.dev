'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { SearchEntry } from '@/lib/posts';

export function SearchBox({ index }: { index: SearchEntry[] }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: ['title', 'summary', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [index],
  );

  const results = query.trim() ? fuse.search(query).map((r) => r.item) : index;
  const hasQuery = query.trim().length > 0;

  return (
    <div>
      <div className="focus-underline relative border-b border-[var(--rule)]">
        <input
          type="search"
          autoFocus
          placeholder="검색어를 입력하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent border-0 py-3 pr-10 text-[16px] outline-none placeholder:text-[var(--muted)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[12px] text-[var(--muted)] tabular-nums transition-opacity duration-300"
          style={{ opacity: results.length ? 1 : 0.4 }}
        >
          {results.length}
        </span>
      </div>

      <p className="text-[12px] text-[var(--muted)] mt-3 tracking-wide transition-opacity duration-200">
        {hasQuery ? `"${query.trim()}"` : '전체 목록'}
      </p>

      <ul
        key={hasQuery ? query.trim() : 'all'}
        className="stagger mt-8 list-none p-0 m-0"
      >
        {results.length === 0 ? (
          <li className="text-sm text-[var(--muted)] py-8 text-center">
            결과 없음
          </li>
        ) : (
          results.map((r, i) => (
            <li
              key={r.slug}
              style={{ '--i': i } as CSSProperties}
              className="group border-t border-[var(--rule)] first:border-t-0"
            >
              <Link href={`/posts/${r.slug}`} className="block py-4">
                <span className="row-nudge inline-block">
                  <span className="link">{r.title}</span>
                </span>
                {r.summary ? (
                  <p className="text-[13.5px] text-[var(--muted)] mt-1.5 leading-relaxed">
                    {r.summary}
                  </p>
                ) : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
