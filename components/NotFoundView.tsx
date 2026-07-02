import Link from 'next/link';
import { localePath, ui, type Locale } from '@/lib/i18n';

export function NotFoundView({ locale }: { locale: Locale }) {
  const t = ui[locale];
  return (
    <section className="py-24">
      <p className="text-[13px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4">
        404
      </p>
      <h1 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.015em] mb-3">
        {t.notFoundTitle}
      </h1>
      <p className="text-[14px] text-[var(--muted)] mb-8">
        {t.notFoundDesc}
      </p>
      <Link
        href={localePath(locale)}
        className="link text-[15px] hover:text-[var(--muted)] transition-colors duration-300"
      >
        {t.notFoundBack}
      </Link>
    </section>
  );
}
