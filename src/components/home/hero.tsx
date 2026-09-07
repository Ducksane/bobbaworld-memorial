import Image from "next/image";
import { useTranslations } from "next-intl";
import { ParallaxLayer } from "@/components/effects/parallax-layer";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/config/site";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <header className="relative flex min-h-screen flex-col justify-end px-[5vw] pb-[8vh]">
      <ParallaxLayer
        factor={0.32}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,.55)_22%,#000_48%,#000_70%,rgba(0,0,0,0)_100%)]"
      >
        <div className="absolute inset-0 animate-zoom will-change-transform">
          <Image
            src="/images/landing-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_45%]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,11,22,0)_45%,rgba(5,11,22,.55)_78%,rgba(5,11,22,.9)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,11,22,.55)_0%,rgba(5,11,22,0)_55%)]" />
      </ParallaxLayer>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-[5vw] py-[26px] font-pixel text-[10px] uppercase tracking-[.2em] text-cream/70">
        <span className="flex items-center gap-2.5 whitespace-nowrap">
          <span aria-hidden className="size-[7px] animate-blink bg-lime" />
          {t("badge")}
        </span>
        <span className="flex flex-wrap items-center justify-end gap-x-5 gap-y-1.5">
          <span>{t("domain")}</span>
          <LocaleSwitcher />
        </span>
      </div>

      <div className="relative">
        <p className="mb-[18px] animate-rise font-pixel text-[clamp(11px,1.2vw,14px)] uppercase tracking-[.24em] text-lime">
          {t("tagline")}
        </p>
        <h1 className="mb-[34px] -ml-[0.04em] animate-rise-late font-display text-[clamp(60px,13.5vw,196px)] leading-[.86] font-extrabold tracking-[-.045em] text-paper display-opsz [text-shadow:0_10px_60px_rgba(5,11,22,.8)]">
          {t("title")}
        </h1>
        <div className="flex animate-rise-later flex-wrap items-end justify-between gap-x-12 gap-y-7">
          <p className="max-w-[540px] text-[clamp(16px,1.35vw,19px)] leading-[1.55] text-pretty text-cream/86">
            {t("description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={siteConfig.links.discord} external>
              {t("ctaDiscord")}
              <span aria-hidden>↗</span>
            </ButtonLink>
            <ButtonLink href="#chronologie" variant="outline">
              {t("ctaStory")}
              <span aria-hidden>↓</span>
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
