"use client";

import { usePathname } from "next/navigation";
import { otherLocale, switchLocalePath, ui, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { ko: "KO", en: "EN" };

// KO↔EN은 서로 다른 루트 레이아웃((ko)/(en) route group)을 넘나들어 전체 페이지 로드가
// 필요하다 — next/link의 소프트 내비게이션은 경계에서 간헐적으로 실패하므로 하드 <a>로 이동한다.
export function LocaleSwitcher({ locale, otherSlugs }: { locale: Locale; otherSlugs: string[] }) {
  const pathname = usePathname();
  const target = otherLocale(locale);
  const href = switchLocalePath(pathname, target, otherSlugs);
  const setCookie = () => {
    document.cookie = `locale=${target}; path=/; max-age=31536000; samesite=lax`;
  };

  const item = (loc: Locale) =>
    loc === locale ? (
      <span aria-current="true" className="relative text-[var(--fg)] font-semibold">
        {LABELS[loc]}
        <span aria-hidden className="absolute left-0 right-0 -bottom-1 h-px bg-[var(--fg)]" />
      </span>
    ) : (
      <a
        href={href}
        hrefLang={loc}
        onClick={setCookie}
        className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200"
      >
        {LABELS[loc]}
      </a>
    );

  return (
    <div
      role="group"
      aria-label={ui[locale].switchToOther}
      className="flex items-center gap-2.5 text-[13px] uppercase tracking-[0.04em] tabular-nums"
    >
      {item("ko")}
      <span aria-hidden className="text-[var(--rule)]">
        ·
      </span>
      {item("en")}
    </div>
  );
}
