import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="ui-sans flex items-center justify-between gap-4 border-b border-[var(--rule)] py-6 mb-10 text-sm">
      <Link href="/" className="no-underline font-medium">
        seojun.blog
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/posts" className="no-underline">Posts</Link>
        <Link href="/tags" className="no-underline">Tags</Link>
        <Link href="/about" className="no-underline">About</Link>
        <Link href="/search" className="no-underline" aria-label="Search">Search</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
