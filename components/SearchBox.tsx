'use client';

import { useMemo, useState } from 'react';
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

  const results = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : index;

  return (
    <div>
      <input
        type="search"
        autoFocus
        placeholder="검색어를 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="ui-sans w-full border-b border-[var(--rule)] bg-transparent py-2 outline-none focus:border-[var(--fg)]"
      />
      <ul className="mt-6 space-y-4 list-none p-0 m-0">
        {results.length === 0 ? (
          <li className="ui-sans text-sm text-[var(--muted)]">결과 없음</li>
        ) : (
          results.map((r) => (
            <li key={r.slug}>
              <Link href={`/posts/${r.slug}`} className="no-underline block">
                <span>{r.title}</span>
              </Link>
              {r.summary ? (
                <p className="ui-sans text-sm text-[var(--muted)] mt-1">
                  {r.summary}
                </p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
