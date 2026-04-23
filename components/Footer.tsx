import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--rule)] mt-20 sm:mt-28">
      <div className="mx-auto w-full max-w-[680px] px-4 sm:px-5 py-7 sm:py-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-[13px] text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href="/"
            className="font-semibold text-[15px] tracking-[-0.012em] text-[var(--fg)]"
          >
            codydev
            <span className="font-normal text-[var(--muted)]">.blog</span>
          </Link>
          <span>© {year}</span>
        </div>
        <nav
          aria-label="Footer"
          className="flex items-center gap-5 text-[14px]"
        >
          <Link
            href="/posts"
            className="hover:text-[var(--fg)] transition-colors duration-200"
          >
            Posts
          </Link>
          <Link
            href="/about"
            className="hover:text-[var(--fg)] transition-colors duration-200"
          >
            About
          </Link>
          <a
            href="/feed.xml"
            className="hover:text-[var(--fg)] transition-colors duration-200"
          >
            RSS
          </a>
        </nav>
      </div>
    </footer>
  );
}
