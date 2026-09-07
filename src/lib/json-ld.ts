import { siteConfig } from "@/config/site";

export function organizationJsonLd(description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: ["Bobba World", "BobbaVille"],
    url: siteConfig.url.origin,
    slogan: siteConfig.slogan,
    description,
    foundingDate: "2007-05-07",
    founder: { "@type": "Person", name: "TheStaff" },
    sameAs: [
      siteConfig.links.discord,
      siteConfig.links.twitter,
      siteConfig.links.youtube,
      siteConfig.links.blog,
    ],
  };
}
