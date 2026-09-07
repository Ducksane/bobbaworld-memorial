import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "@/lib/seo";

// Internal hrefs to list, independent of locale. Extend when adding routes (e.g. the blog).
const hrefs = ["/"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await Promise.all(
    hrefs.flatMap((href) =>
      routing.locales.map(async (locale) => {
        const languages = Object.fromEntries(
          await Promise.all(
            routing.locales.map(
              async (candidate) =>
                [candidate, await localizedUrl(href, candidate)] as const,
            ),
          ),
        );

        return {
          url: languages[locale],
          lastModified: new Date(),
          alternates: {
            languages: {
              ...languages,
              "x-default": languages[routing.defaultLocale],
            },
          },
        } satisfies MetadataRoute.Sitemap[number];
      }),
    ),
  );

  return entries;
}
