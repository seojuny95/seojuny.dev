import { getSearchIndex } from '@/lib/posts';
import { SearchBox } from '@/components/SearchBox';

export const metadata = { title: 'Search — seojun.blog' };

export default function SearchPage() {
  const index = getSearchIndex();
  return (
    <section>
      <h1 className="ui-sans text-xl font-medium mb-8">Search</h1>
      <SearchBox index={index} />
    </section>
  );
}
