import { getSearchIndex } from '@/lib/posts';
import { SearchBox } from '@/components/SearchBox';

export const metadata = { title: 'Search — codydev.blog' };

export default function SearchPage() {
  const index = getSearchIndex();
  return (
    <section>
      <header className="mb-10">
        <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
          Find
        </p>
        <h1 className="text-[22px] leading-[1.4] tracking-[-0.01em]">Search</h1>
      </header>
      <SearchBox index={index} />
    </section>
  );
}
