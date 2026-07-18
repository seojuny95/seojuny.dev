import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllPosts, formatDate } from "@/lib/posts";
import { localePath, ui, type Locale } from "@/lib/i18n";

export function PostList({ locale }: { locale: Locale }) {
  const posts = getAllPosts(locale);
  const byYear = new Map<string, typeof posts>();
  for (const p of posts) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  let runningIndex = 0;

  return (
    <section>
      <h1 className="sr-only">Posts</h1>

      {years.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{ui[locale].noPosts}</p>
      ) : (
        <div className="stagger flex flex-col gap-10">
          {years.map((year) => {
            const list = byYear.get(year)!;
            return (
              <section
                key={year}
                style={{ "--i": runningIndex++ } as CSSProperties}
                className="flex flex-col sm:flex-row sm:gap-8"
              >
                <h2 className="text-[22px] sm:text-[26px] font-semibold text-[var(--fg)] mb-3 sm:mb-0 sm:w-[96px] shrink-0 tabular-nums tracking-[-0.01em] sm:pt-[3px]">
                  {year}
                </h2>
                <ul className="flex-1 list-none p-0 m-0 flex flex-col">
                  {list.map((p) => (
                    <li
                      key={p.slug}
                      className="group border-t border-[var(--rule)] first:border-t-0"
                    >
                      <article>
                        <Link
                          href={localePath(locale, `/${p.slug}`)}
                          className="block py-4 row-nudge"
                        >
                          <h3 className="font-medium leading-snug text-[18px] m-0">
                            <span className="link">{p.title}</span>
                          </h3>
                          <div className="flex items-baseline gap-2 text-[13px] text-[var(--muted)] mt-1 tabular-nums tracking-wide transition-colors duration-300 group-hover:text-[var(--fg)]">
                            <time dateTime={p.date}>{formatDate(p.date, locale)}</time>
                            <span aria-hidden className="opacity-60">
                              ·
                            </span>
                            <span>{ui[locale].minRead(p.readingTime)}</span>
                          </div>
                          {p.summary ? (
                            <p className="text-[14px] text-[var(--muted)] mt-1.5 leading-relaxed">
                              {p.summary}
                            </p>
                          ) : null}
                        </Link>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
