import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AudioPlayer } from "@/components/audio/audio-player";
import { EasterEggs } from "@/components/effects/easter-eggs";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { StarField } from "@/components/effects/star-field";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/layout/skip-link";
import { fontVariables } from "@/app/fonts";
import "lenis/dist/lenis.css";
import "@/app/globals.css";

type SiteShellProps = {
  lang: string;
  children: ReactNode;
};

/**
 * The full document. Shared by the `[locale]` layout and `global-not-found`,
 * which bypasses layouts and so has to render `<html>`/`<body>` itself.
 */
export function SiteShell({ lang, children }: SiteShellProps) {
  return (
    <html lang={lang} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col bg-night font-sans text-[17px] leading-[1.6] text-cream">
        <NextIntlClientProvider>
          <SkipLink />
          <SmoothScroll />
          <StarField />
          <div
            data-quake
            data-dim
            className="relative z-[1] flex flex-1 flex-col overflow-x-hidden"
          >
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
            <SiteFooter />
          </div>
          <AudioPlayer />
          <EasterEggs />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
