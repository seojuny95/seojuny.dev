import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: 'Posts — seojun.blog' };

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
      <h1 className="ui-sans text-xl font-medium mb-8">Posts</h1>
      {years.length === 0 ? (
        <p className="ui-sans text-sm text-[var(--muted)]">글이 아직 없습니다.</p>
      ) : (
        years.map((year) => (
          <div key={year} className="mb-10">
            <h2 className="ui-sans text-sm text-[var(--muted)] mb-3">{year}</h2>
            <ul className="list-none p-0 m-0 space-y-2">
              {byYear.get(year)!.map((p) => (
                <li key={p.slug} className="flex items-baseline gap-4">
                  <time className="ui-sans text-sm text-[var(--muted)] w-24 shrink-0 tabular-nums">
                    {p.date}
                  </time>
                  <Link href={`/posts/${p.slug}`} className="no-underline flex-1">
                    {p.title}
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
