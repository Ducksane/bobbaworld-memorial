import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // `/` serves French (default), `/en` serves English.
  localePrefix: "as-needed",
  // Keep URLs deterministic: `/` is always FR, `/en` always EN.
  // No redirect based on the browser language or a stored cookie.
  localeDetection: false,
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
