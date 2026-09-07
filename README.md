# Mémorial BobbaWorld

Page mémorial de BobbaWorld (2007 — 2015), construite avec Next.js 16, React 19, Tailwind CSS 4 et next-intl.

## Démarrer

```bash
pnpm install
pnpm dev
```

- `/` — version française (langue par défaut)
- `/en` — version anglaise

Variables d’environnement : voir `.env.example`. `NEXT_PUBLIC_SITE_URL` fixe l’URL canonique (OpenGraph, sitemap, hreflang). Sans cette variable, la production utilise `https://bobbaworld.fr`.

## Structure

```
messages/                 Textes par langue (fr.json = référence, en.json)
public/
  icons/                  Favicons PNG (16 → 512)
  images/                 Visuels du design (fond du hero, logo)
  favicon.ico, og.png     Favicon et image OpenGraph
src/
  app/
    [locale]/             Layout racine (metadata), page d’accueil, erreur
    global-not-found.tsx  404 des URL inconnues (rendue hors layout, document complet)
    fonts.ts              Polices next/font partagées
    manifest.ts           Web manifest
    robots.ts, sitemap.ts SEO (sitemap avec alternates par langue)
    globals.css           Tokens de marque (@theme), keyframes, styles de base
  components/
    effects/              Ciel étoilé, parallaxe, apparition au scroll
    home/                 Sections de la page d’accueil (hero, chronologie, citation, Discord)
    layout/               Coquille du document, pied de page, sélecteur de langue, 404
    seo/                  JSON-LD
    ui/                   Primitives (Container, ButtonLink, PixelLabel)
  config/site.ts          Nom, URL, liens externes, couleurs de marque
  content/timeline.ts     Données structurelles de la chronologie (dates, ids)
  i18n/                   Routing next-intl, navigation, chargement des messages
  lib/                    Helpers SEO (alternates, JSON-LD)
  proxy.ts                Proxy next-intl (détection du préfixe de langue)
```

## Internationalisation

- Les locales sont déclarées dans `src/i18n/routing.ts` (`fr` par défaut, préfixe seulement pour `en`).
- Les textes vivent dans `messages/<locale>.json`, organisés par composant. `messages/fr.json` sert de référence de typage : toute clé ajoutée en FR doit exister en EN.
- Composants serveur : `useTranslations()` / `getTranslations()`. Composants client : `useTranslations()` sous `NextIntlClientProvider` (déjà en place dans le layout).
- Liens internes : importer `Link` depuis `@/i18n/navigation` pour conserver la langue courante.

## Ajouter une page (ex. blog)

1. Créer la route sous `src/app/[locale]/blog/…`.
2. Exporter un `generateMetadata` qui retourne `alternates: await localizedAlternates("/blog")` (helper dans `src/lib/seo.ts`).
3. Ajouter le chemin dans `src/app/sitemap.ts`.
4. Ajouter les textes dans `messages/fr.json` puis `messages/en.json`.
