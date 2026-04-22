import { getAllPosts } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 20);
  return (
    <section>
      <div className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Posts
        </p>
      </div>
      <PostList posts={posts} />
    </section>
  );
}
