import { useTranslations } from "next-intl";
import { Reveal } from "@/components/effects/reveal";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PixelLabel } from "@/components/ui/pixel-label";
import { siteConfig } from "@/config/site";

export function DiscordCta() {
  const t = useTranslations("Discord");

  return (
    <section id="discord">
      <Container className="pt-[140px] pb-[60px]">
        <Reveal className="flex flex-wrap items-center justify-between gap-x-12 gap-y-8 border border-lime/35 bg-[linear-gradient(135deg,rgba(108,194,74,.10),rgba(46,196,196,.06)_60%,rgba(5,11,22,0))] px-[clamp(24px,4vw,56px)] py-11">
          <div className="min-w-0 flex-[1_1_360px]">
            <PixelLabel
              dot={7}
              blink
              className="mb-[18px] text-[10px] tracking-[.18em] text-lime"
            >
              {t("label")}
            </PixelLabel>
            <h2 className="mb-3.5 font-display text-[clamp(28px,3.6vw,42px)] leading-[1.05] font-bold tracking-[-.03em] text-balance text-paper">
              {t("title")}
            </h2>
            <p className="max-w-[520px] text-pretty text-cream/74">
              {t.rich("body", {
                strong: (chunks) => (
                  <strong className="font-semibold text-paper">{chunks}</strong>
                ),
              })}
            </p>
          </div>
          <ButtonLink href={siteConfig.links.discord} external size="lg">
            {t("cta")}
            <span aria-hidden>↗</span>
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
