"use client";

import { useTranslations } from "next-intl";
import { buttonClassName } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PixelLabel } from "@/components/ui/pixel-label";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations("Error");

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
        <button
          type="button"
          onClick={reset}
          className={buttonClassName("primary", "md", "mt-10 cursor-pointer")}
        >
          {t("retry")}
        </button>
      </Container>
    </section>
  );
}
