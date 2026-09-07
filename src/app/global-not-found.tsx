import type { Metadata, Viewport } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { SiteShell } from "@/components/layout/site-shell";
import { siteConfig } from "@/config/site";
import { baseMetadata } from "@/lib/seo";

// Serves every URL that matches no route. Next.js skips layouts here, so the
// document shell, global styles and metadata are rendered by this file.
export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound");
  return { ...baseMetadata, title: t("title") };
}

export default async function GlobalNotFound() {
  const locale = await getLocale();

  return (
    <SiteShell lang={locale}>
      <NotFoundContent />
    </SiteShell>
  );
}
