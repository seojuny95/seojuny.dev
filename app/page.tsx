import { getAllPosts } from '@/lib/posts';
import { PostList } from '@/components/PostList';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 20);
  return (
    <section>
      <div className="mb-14">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-3">
          Journal
        </p>
        <h1 className="text-[22px] leading-[1.45] tracking-[-0.01em] max-w-[28ch]">
          생각을 정리하고, 오래 두고 읽을 글을 씁니다.
        </h1>
      </div>
      <PostList posts={posts} />
    </section>
  );
}
