import { localeLanguageTags } from "../../config";
import { defaultLocale, type Locale } from "../../i18n/locales";

const DATE_FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  ko: new Intl.DateTimeFormat(localeLanguageTags.ko, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }),
  en: new Intl.DateTimeFormat(localeLanguageTags.en, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }),
};

export function formatDate(
  isoDate: string,
  locale: Locale = defaultLocale,
): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? isoDate
    : DATE_FORMATTERS[locale].format(date);
}
