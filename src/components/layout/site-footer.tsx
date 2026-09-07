import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { LocaleSwitcher } from "./locale-switcher";

const FOOTER_LINKS = [
  { id: "discord", href: siteConfig.links.discord },
  { id: "twitter", href: siteConfig.links.twitter },
  { id: "youtube", href: siteConfig.links.youtube },
  { id: "wayback", href: siteConfig.links.wayback },
] as const;

export function SiteFooter() {
  const t = useTranslations("Footer");

  return (
    <footer>
      <Container className="flex flex-col gap-9 pt-20 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-t border-cream/14 pt-9">
          <Image
            src="/images/logocolour.png"
            alt={t("logoAlt")}
            width={270}
            height={163}
            className="h-14 w-auto"
          />
          <nav
            aria-label={t("navLabel")}
            className="flex flex-wrap items-center gap-x-7 gap-y-2 font-pixel text-[10px] uppercase tracking-[.16em]"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream no-underline transition-colors hover:text-lime"
              >
                {t(`links.${link.id}`)} <span aria-hidden>↗</span>
              </a>
            ))}
            <LocaleSwitcher />
          </nav>
        </div>
        <p className="max-w-[680px] text-[13px] leading-[1.6] text-pretty text-cream/60">
          {t("disclaimer")}
        </p>
      </Container>
    </footer>
  );
}
