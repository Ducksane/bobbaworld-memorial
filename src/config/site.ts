function resolveSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  if (process.env.NODE_ENV === "production") return new URL("https://bobbaworld.fr");

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

export const siteConfig = {
  name: "BobbaWorld",
  /** Full site name used in metadata (title, og:site_name, manifest). */
  metaName: "BobbaWorld: It’s your world.",
  domainLabel: "bobbaworld.fr",
  slogan: "It’s your world.",
  url: resolveSiteUrl(),
  themeColor: "#050b16",
  ogImage: { path: "/og.png", width: 1200, height: 630 },
  twitterHandle: "@BobbaWorldFR",
  links: {
    discord: "https://discordapp.com/invite/cDawSe5",
    twitter: "https://twitter.com/BobbaWorldFR",
    youtube: "https://www.youtube.com/@BobbaworldFRANCE",
    wayback: "https://web.archive.org/web/*/bobbaworld.fr",
    blog: "https://bobbaworldfrance.wordpress.com/",
  },
} as const;
