'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/lib/nav';
import { localePath, type Locale } from '@/lib/i18n';

export function NavLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const aboutPath = localePath(locale, '/about');
  const isAbout = pathname === aboutPath || pathname.startsWith(`${aboutPath}/`);
  return (
    <nav
      aria-label="Primary"
      className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-medium"
    >
      {navItems(locale).map((item) => {
        const active = item.href === aboutPath ? isAbout : !isAbout;
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
