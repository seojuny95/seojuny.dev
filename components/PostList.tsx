import Link from 'next/link';
import type { Post } from '@/lib/posts';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="ui-sans text-sm text-[var(--muted)]">글이 아직 없습니다.</p>;
  }
  return (
    <ul className="list-none p-0 m-0 space-y-6">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/posts/${p.slug}`} className="no-underline block">
            <div className="flex items-baseline gap-4">
              <time className="ui-sans text-sm text-[var(--muted)] w-24 shrink-0 tabular-nums">
                {p.date}
              </time>
              <span className="flex-1">{p.title}</span>
            </div>
            {p.summary ? (
              <p className="ui-sans text-sm text-[var(--muted)] mt-1 ml-28">
                {p.summary}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
