import { isLocale, type Locale } from "../../i18n/locales";

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const CONTENT_EXTENSION = /\.mdx?$/;

function normalizeEntry(entry: string): string {
  return entry.replaceAll("\\", "/");
}

export function localeFromEntry(entry: string): Locale {
  const locale = normalizeEntry(entry).split("/", 1)[0];

  if (!isLocale(locale)) {
    throw new Error(`Invalid post locale: ${entry}`);
  }

  return locale;
}

export function slugFromEntry(entry: string): string {
  const filename = normalizeEntry(entry).split("/").at(-1) ?? entry;
  return filename.replace(CONTENT_EXTENSION, "").replace(DATE_PREFIX, "");
}

export function postIdFromEntry(entry: string): string {
  return `${localeFromEntry(entry)}/${slugFromEntry(entry)}`;
}

export function aboutIdFromEntry(entry: string): Locale {
  const locale = slugFromEntry(entry);

  if (!isLocale(locale)) {
    throw new Error(`Invalid About locale: ${entry}`);
  }

  return locale;
}
