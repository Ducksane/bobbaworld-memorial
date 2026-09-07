import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/config/site";

/**
 * Locale-independent metadata. Applied by the `[locale]` layout and repeated by
 * `global-not-found`, which renders outside of it.
 */
export const baseMetadata = {
  metadataBase: siteConfig.url,
  applicationName: siteConfig.metaName,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
} satisfies Metadata;

/** Absolute URL for an internal href in a given locale. */
export async function localizedUrl(href: string, locale: Locale): Promise<string> {
  const pathname = await getPathname({ href, locale });
  return new URL(pathname, siteConfig.url).toString();
}

/**
 * Canonical + hreflang alternates for an internal href, resolved for every locale.
 * Use from `generateMetadata` of any page so each route advertises its translations.
 */
export async function localizedAlternates(
  href: string,
): Promise<NonNullable<Metadata["alternates"]>> {
  const locale = await getLocale();
  const entries = await Promise.all(
    routing.locales.map(async (l) => [l, await localizedUrl(href, l)] as const),
  );
  const languages = Object.fromEntries(entries) as Record<Locale, string>;

  return {
    canonical: languages[locale],
    languages: { ...languages, "x-default": languages[routing.defaultLocale] },
  };
}
