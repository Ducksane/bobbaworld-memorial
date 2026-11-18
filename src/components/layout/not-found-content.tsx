import { useTranslations } from "next-intl";
import { RiseWords } from "@/components/effects/rise-words";
import { ScrambleText } from "@/components/effects/scramble-text";
import { QueuePosition } from "@/components/layout/queue-position";
import { buttonClassName } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PixelLabel } from "@/components/ui/pixel-label";
import { Link } from "@/i18n/navigation";

/** 404 body, shared by `global-not-found` and the `[locale]` not-found boundary. */
export function NotFoundContent() {
  const t = useTranslations("NotFound");

  return (
    <section className="flex flex-1 items-center">
      <Container className="py-32">
        <PixelLabel className="mb-6 animate-rise text-[11px] tracking-[.18em] text-lime">
          <ScrambleText text={t("label")} />
        </PixelLabel>
        <h1 className="animate-rise-late font-display text-[clamp(40px,6vw,72px)] leading-none font-extrabold tracking-[-.03em] text-paper">
          <RiseWords text={t("title")} delay={150} />
        </h1>
        <p className="mt-6 max-w-[540px] text-pretty text-cream/74">
          {t("description")}
        </p>
        <QueuePosition />
        <Link href="/" className={buttonClassName("primary", "md", "mt-10")}>
          {t("backHome")}
          <span aria-hidden>←</span>
        </Link>
      </Container>
    </section>
  );
}
