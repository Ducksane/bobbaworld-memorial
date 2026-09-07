import { useTranslations } from "next-intl";
import { Reveal } from "@/components/effects/reveal";
import { Container } from "@/components/ui/container";

export function Quote() {
  const t = useTranslations("Quote");

  return (
    <section>
      <Container className="pt-[140px] pb-10">
        <Reveal as="blockquote" className="mx-auto max-w-[820px] text-center">
          <p className="font-display text-[clamp(28px,4.2vw,48px)] leading-[1.18] font-medium tracking-[-.025em] text-balance text-paper">
            {t("text")}
          </p>
          <footer className="mt-[22px] font-pixel text-[10px] uppercase tracking-[.18em] text-lime">
            {t("author")}
          </footer>
        </Reveal>
      </Container>
    </section>
  );
}
