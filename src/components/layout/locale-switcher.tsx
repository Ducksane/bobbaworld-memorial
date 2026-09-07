"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Inline FR · EN toggle; inherits the pixel typography of its container.
 * Renders no landmark of its own: it sits inside a `<span>` in the hero and
 * inside the footer `<nav>`.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Layout.localeSwitcher");

  return (
    <span
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center gap-2"
    >
      {routing.locales.map((candidate, index) => {
        const isActive = candidate === locale;
        return (
          <Fragment key={candidate}>
            {index > 0 && <span aria-hidden>·</span>}
            <Link
              // `getPathname` keeps the default locale unprefixed, so FR links to
              // `/` rather than to `/fr`, which the proxy would redirect to `/`.
              href={getPathname({ href: pathname, locale: candidate })}
              hrefLang={candidate}
              lang={candidate}
              aria-label={t(`names.${candidate}`)}
              aria-current={isActive ? "page" : undefined}
              className={`no-underline transition-colors ${
                isActive ? "text-cream" : "text-cream/45 hover:text-lime"
              }`}
            >
              {t(`short.${candidate}`)}
            </Link>
          </Fragment>
        );
      })}
    </span>
  );
}
