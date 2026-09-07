import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscordCta } from "@/components/home/discord-cta";
import { Hero } from "@/components/home/hero";
import { Quote } from "@/components/home/quote";
import { Timeline } from "@/components/home/timeline";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/json-ld";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: await localizedAlternates("/"),
  };
}

export default async function HomePage() {
  const t = await getTranslations("Organization");

  return (
    <>
      <JsonLd data={organizationJsonLd(t("description"))} />
      <Hero />
      <Timeline />
      <Quote />
      <DiscordCta />
    </>
  );
}
