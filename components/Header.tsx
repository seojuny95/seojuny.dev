import Link from "next/link";
import { SearchTrigger } from "./SearchTrigger";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { localePath, type Locale } from "@/lib/i18n";

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[680px] px-4 sm:px-5 h-[57px] flex items-center">
        <Link
          href={localePath(locale)}
          aria-label="seojuny.dev"
          className="shrink-0 font-semibold text-[15px] tracking-[-0.012em]"
        >
          seojuny
          <span className="text-[var(--muted)] font-normal">.dev</span>
        </Link>

        <NavLinks locale={locale} />

        <div className="hidden md:flex items-center ml-auto pl-4 border-l border-[var(--rule)]">
          <SearchTrigger />
        </div>

        <div className="md:hidden ml-auto flex items-center gap-3">
          <SearchTrigger />
          <MobileMenu locale={locale} />
        </div>
      </div>

      <div
        id="reading-progress"
        aria-hidden
        className="absolute left-0 right-0 -bottom-px h-[2px] pointer-events-none"
      />
    </header>
  );
}
