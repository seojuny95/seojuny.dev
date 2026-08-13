import type { Locale } from "./locales";

export function localeFromPathname(pathname: string): Locale {
  return pathname.replace(/^\/+/, "").split("/", 1)[0] === "en" ? "en" : "ko";
}

export function localePath(locale: Locale, path = "/"): string {
  if (locale === "ko") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

export function switchLocalePath(
  pathname: string,
  to: Locale,
  availableSlugs: readonly string[],
): string {
  const bare = pathname === "/en" ? "/" : pathname.replace(/^\/en\//, "/");

  if (bare === "/" || bare === "/about") {
    return localePath(to, bare);
  }

  const slug = bare.replace(/^\//, "");
  return availableSlugs.includes(slug) ? localePath(to, bare) : localePath(to);
}
