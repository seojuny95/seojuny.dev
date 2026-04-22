import Link from 'next/link';
import { getAllTags } from '@/lib/posts';

export const metadata = { title: 'Tags — seojun.blog' };

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">Tags</h1>
      {tags.length === 0 ? (
        <p className="ui-sans text-sm text-[var(--muted)]">태그가 아직 없습니다.</p>
      ) : (
        <ul className="ui-sans list-none p-0 m-0 flex flex-wrap gap-x-4 gap-y-2">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${encodeURIComponent(tag)}`}
                className="no-underline"
              >
                #{tag}{' '}
                <span className="text-[var(--muted)] text-sm">({count})</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
