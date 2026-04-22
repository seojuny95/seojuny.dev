import { getAllPosts } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 20);
  return (
    <section>
      <p className="ui-sans text-sm text-[var(--muted)] mb-10">생각을 기록하는 곳.</p>
      <PostList posts={posts} />
    </section>
  );
}
