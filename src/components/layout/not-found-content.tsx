import { useTranslations } from "next-intl";
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
        <PixelLabel className="mb-6 text-[11px] tracking-[.18em] text-lime">
          {t("label")}
        </PixelLabel>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] leading-none font-extrabold tracking-[-.03em] text-paper">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-[540px] text-pretty text-cream/74">
          {t("description")}
        </p>
        <Link href="/" className={buttonClassName("primary", "md", "mt-10")}>
          {t("backHome")}
          <span aria-hidden>←</span>
        </Link>
      </Container>
    </section>
  );
}
