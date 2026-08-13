import { defaultLocale, locales } from "../config";

export { defaultLocale, locales };

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ko" ? "en" : "ko";
}
