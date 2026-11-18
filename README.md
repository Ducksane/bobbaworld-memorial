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
    badges/               Toast et compteur des badges (un par easter egg)
    effects/              Ciel étoilé, parallaxe, animations au scroll, easter eggs
      sky/                Événements du ciel (aurore, constellation, comète)
    home/                 Sections de la page d’accueil (hero, chronologie, citation, Discord)
    layout/               Coquille du document, pied de page, sélecteur de langue, 404
    seo/                  JSON-LD
    ui/                   Primitives (Container, ButtonLink, PixelLabel)
  config/site.ts          Nom, URL, liens externes, couleurs de marque
  content/timeline.ts     Données structurelles de la chronologie (dates, ids)
  i18n/                   Routing next-intl, navigation, chargement des messages
  lib/                    Helpers SEO (alternates, JSON-LD), horloge du ciel, badges, filtre des gros mots
  proxy.ts                Proxy next-intl (détection du préfixe de langue)
```

## Easter eggs et animations

Tout est monté une fois par `src/components/effects/easter-eggs.tsx`.

- **Le ciel vivant** : `src/lib/sky-schedule.ts` tire au hasard, toutes les une à deux minutes de page visible, un événement parmi le canard, l’aurore, la constellation et la comète. En développement, `bwSky("aurora")` dans la console en déclenche un à la demande (`duck`, `aurora`, `constellation`, `comet`).
- **Une étoile par joueur** : cliquer une étoile du fond affiche un pseudo. La liste est dans `src/content/players.ts` ; les membres marqués `staff` y sont signalés et débloquent un badge à part.
- **Le filtre des gros mots** : taper au clavier ouvre une barre de chat ; les gros mots listés dans `src/lib/bobba-filter.ts` deviennent « #&@!% », comme sur BobbaWorld. Le badge s’appelle toujours « Bobba ! ».
- **Le black-out** : le point de l’entrée « 24 avril 2013 » de la chronologie éteint la page ; il se joue aussi seul chaque 24 avril.
- **La file d’attente** : sur la page 404.
- **Les badges** : `src/lib/badges.ts` en garde un par easter egg trouvé dans `localStorage` ; le compteur apparaît dans le pied de page dès le premier.
- **Les sons** : `src/lib/sfx.ts` liste les effets sonores (fichiers dans `public/audio/sfx/` ; l’aurore, la constellation et le black-out ont été générés avec Suno). Ils suivent le réglage « volume faible » du lecteur. Les sons qui arrivent sans action du visiteur (aurore, constellation, black-out du 24 avril) se taisent tant que la musique joue ; la notification de badge, elle, sonne toujours.

Le défilement est lissé par Lenis (`smooth-scroll.tsx`). La chronologie s’allume au fil du scroll et le ciel s’assombrit sur les fermetures (`timeline-track.tsx`) ; les citations se lisent mot à mot (`scrub-text.tsx`). Les libellés en Silkscreen se décodent comme un terminal (`scramble-text.tsx`), les grands titres montent mot par mot (`rise-words.tsx`), les années de la chronologie défilent depuis la précédente (`count-up-year.tsx`) et le titre du hero s’efface en traînant au scroll (`scroll-away.tsx`). Sous `prefers-reduced-motion`, les animations au scroll et les événements visuels du ciel sont coupés ; le canard, le chat, les étoiles et le black-out restent, sans mouvement.

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
