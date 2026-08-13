export const site = {
  name: "seojuny.dev",
  url: new URL("https://seojuny.dev"),
} as const;

export const locales = ["ko", "en"] as const;

export const defaultLocale = "ko" satisfies (typeof locales)[number];

export const localeLanguageTags = {
  ko: "ko-KR",
  en: "en-US",
} as const satisfies Record<(typeof locales)[number], string>;
