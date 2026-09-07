import type { Locale } from "./routing";

type LocaleMeta = {
  /** Human-readable name, shown in the language switcher. */
  label: string;
  /** Open Graph `og:locale` value. */
  ogLocale: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  fr: { label: "Français", ogLocale: "fr_FR" },
  en: { label: "English", ogLocale: "en_US" },
};
