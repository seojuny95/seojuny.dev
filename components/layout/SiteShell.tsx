import { Analytics } from '@vercel/analytics/next';
import '@/app/globals.css';
import { pretendard } from '@/app/fonts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchModal } from '@/components/SearchModal';
import { getAllPosts, getSearchIndex } from '@/lib/posts';
import { otherLocale, ui, type Locale } from '@/lib/i18n';
import { buildSiteJsonLd } from '@/lib/metadata';

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const searchIndex = getSearchIndex(locale);
  const otherSlugs = getAllPosts(otherLocale(locale)).map((p) => p.slug);
  return (
    <html lang={locale} className={pretendard.variable}>
      <body>
        <script type="application/ld+json">
          {JSON.stringify(buildSiteJsonLd(locale))}
        </script>
        <a href="#main" className="skip-link">{ui[locale].skipLink}</a>
        <div className="min-h-screen flex flex-col">
          <Header locale={locale} otherSlugs={otherSlugs} />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-[680px] px-4 sm:px-5 flex-1 pt-10 sm:pt-14 outline-none"
          >
            {children}
          </main>
          <Footer locale={locale} />
        </div>
        <SearchModal index={searchIndex} locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
