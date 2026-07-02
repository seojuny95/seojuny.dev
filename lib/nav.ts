import { localePath, type Locale } from '@/lib/i18n';

export function navItems(locale: Locale) {
  return [
    { href: localePath(locale), label: 'Posts', match: [localePath(locale)] },
    { href: localePath(locale, '/about'), label: 'About', match: [localePath(locale, '/about')] },
  ] as const;
}
