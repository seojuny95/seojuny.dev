import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function HomePage() {
  const all = getAllPosts();
  const recent = all.slice(0, 5);
  const hasMore = all.length > recent.length;
  return (
    <section>
      <h1 className="sr-only">최근 글</h1>
      <div className="mb-10 flex items-baseline justify-between">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)]" aria-hidden>
          Recent
        </p>
        {hasMore ? (
          <Link
            href="/posts"
            className="text-[13px] text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-300"
          >
            Archive →
          </Link>
        ) : null}
      </div>
      <PostList posts={recent} />
    </section>
  );
}
