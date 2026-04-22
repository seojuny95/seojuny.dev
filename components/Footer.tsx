export function Footer() {
  return (
    <footer className="ui-sans flex justify-between border-t border-[var(--rule)] mt-16 py-6 text-sm text-[var(--muted)]">
      <span>© {new Date().getFullYear()} seojun</span>
      <a href="/feed.xml" className="no-underline">RSS</a>
    </footer>
  );
}
