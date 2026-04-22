export function Footer() {
  return (
    <footer className="flex justify-between items-center border-t border-[var(--rule)] mt-16 pt-5 pb-8 text-[12px] sm:mt-24 sm:pt-6 sm:pb-10 sm:text-[13px] text-[var(--muted)]">
      <span>© {new Date().getFullYear()} codydev</span>
      <a
        href="/feed.xml"
        className="link hover:text-[var(--fg)] transition-colors duration-300"
      >
        RSS
      </a>
    </footer>
  );
}
