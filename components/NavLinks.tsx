'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-medium"
    >
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`relative transition-colors duration-200 ${
              active
                ? 'text-[var(--fg)]'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            {item.label}
            {active && (
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-1.5 h-px bg-[var(--fg)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
