import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="reveal reveal-delay-1 pt-8 pb-5 mb-10 flex flex-wrap items-center gap-x-5 gap-y-4 text-[13px] tracking-[0.01em] sm:pt-9 sm:pb-6 sm:mb-12">
      <Link
        href="/"
        className="font-medium tracking-[-0.01em] text-[15px]"
      >
        codydev
        <span className="text-[var(--muted)] font-normal">.blog</span>
      </Link>
      <nav className="order-3 w-full flex items-center gap-4 text-[var(--muted)] sm:order-2 sm:w-auto sm:ml-auto sm:gap-5">
        <Link href="/posts" className="link hover:text-[var(--fg)] transition-colors duration-300">Posts</Link>
        <Link href="/tags" className="link hover:text-[var(--fg)] transition-colors duration-300">Tags</Link>
        <Link href="/about" className="link hover:text-[var(--fg)] transition-colors duration-300">About</Link>
        <Link href="/search" className="link hover:text-[var(--fg)] transition-colors duration-300" aria-label="Search">Search</Link>
      </nav>
      <div className="order-2 ml-auto sm:order-3 sm:ml-0">
        <ThemeToggle />
      </div>
    </header>
  );
}
