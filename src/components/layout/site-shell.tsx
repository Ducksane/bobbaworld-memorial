import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { AudioPlayer } from "@/components/audio/audio-player";
import { DuckEasterEgg } from "@/components/effects/duck-easter-egg";
import { StarField } from "@/components/effects/star-field";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/layout/skip-link";
import { fontVariables } from "@/app/fonts";
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
    <html lang={lang} className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-night font-sans text-[17px] leading-[1.6] text-cream">
        <NextIntlClientProvider>
          <SkipLink />
          <StarField />
          <div
            data-quake
            className="relative z-[1] flex flex-1 flex-col overflow-x-hidden"
          >
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
            <SiteFooter />
          </div>
          <AudioPlayer />
          <DuckEasterEgg />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
