import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/config/site";
import { localeMeta } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { baseMetadata } from "@/lib/seo";

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");

  return {
    ...baseMetadata,
    title: { default: title, template: t("titleTemplate") },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: siteConfig.metaName,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: routing.locales
        .filter((candidate) => candidate !== locale)
        .map((candidate) => localeMeta[candidate].ogLocale),
      title,
      description: t("ogDescription"),
      images: [
        {
          url: siteConfig.ogImage.path,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: t("ogImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title,
      description: t("ogDescription"),
      images: [siteConfig.ogImage.path],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return <SiteShell lang={locale}>{children}</SiteShell>;
}
