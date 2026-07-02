'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { otherLocale, switchLocalePath, ui, type Locale } from '@/lib/i18n';

export function LocaleSwitcher({
  locale,
  otherSlugs,
}: {
  locale: Locale;
  otherSlugs: string[];
}) {
  const pathname = usePathname();
  const target = otherLocale(locale);
  const href = switchLocalePath(pathname, target, otherSlugs);
  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={ui[locale].switchToOther}
      onClick={() => {
        document.cookie = `locale=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 uppercase tracking-wide"
    >
      {target === 'en' ? 'EN' : 'KO'}
    </Link>
  );
}
