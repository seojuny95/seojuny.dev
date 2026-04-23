import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { SearchTrigger } from './SearchTrigger';
import { MobileMenu } from './MobileMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
      <div className="mx-auto w-full max-w-[680px] px-4 sm:px-5 h-[57px] flex items-center">
        <Link
          href="/"
          aria-label="codydev.blog"
          className="shrink-0 font-semibold text-[15px] tracking-[-0.012em]"
        >
          codydev
          <span className="text-[var(--muted)] font-normal">.blog</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-medium text-[var(--muted)]"
        >
          <Link href="/posts" className="hover:text-[var(--fg)] transition-colors duration-200">
            Posts
          </Link>
          <Link href="/about" className="hover:text-[var(--fg)] transition-colors duration-200">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4 ml-auto pl-4 border-l border-[var(--rule)]">
          <SearchTrigger />
          <ThemeToggle />
        </div>

        <div className="md:hidden ml-auto flex items-center gap-3">
          <SearchTrigger />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
