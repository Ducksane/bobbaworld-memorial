import { useTranslations } from "next-intl";
import { Reveal } from "@/components/effects/reveal";
import { Container } from "@/components/ui/container";
import { PixelLabel } from "@/components/ui/pixel-label";
import { timeline } from "@/content/timeline";

/** Pulls a quiet entry towards the milestone it belongs to. */
const quietAttach = {
  prelude: "-mb-[44px]",
  note: "-mt-[44px]",
} as const;

export function Timeline() {
  const t = useTranslations("Timeline");

  return (
    <section id="chronologie">
      <Container className="pt-[120px] pb-10">
        <PixelLabel className="mb-14 text-[11px] tracking-[.18em] text-lime">
          {t("label")}
        </PixelLabel>

        <ol className="flex flex-col gap-[76px] border-l border-cream/14 pl-7">
          {timeline.map((entry) => {
            const quiet = entry.kind !== undefined;
            // Empty when only the year is known — the month line is then dropped.
            const date = t(`entries.${entry.id}.date`);

            return (
              <Reveal
                as="li"
                key={entry.id}
                className={`relative flex flex-wrap gap-x-10 gap-y-2 ${
                  entry.kind ? quietAttach[entry.kind] : ""
                }`}
              >
                <span
                  aria-hidden
                  className={
                    quiet
                      ? "absolute top-[9px] -left-[31px] size-[5px] rotate-45 border border-cream/45 bg-night"
                      : entry.tone === "end"
                        ? "absolute top-4 -left-[33px] size-[9px] bg-ember shadow-[0_0_12px_rgba(226,86,75,.7)]"
                        : "absolute top-4 -left-[33px] size-[9px] bg-lime shadow-[0_0_12px_rgba(108,194,74,.7)]"
                  }
                />
                <div className="flex-[0_0_170px]">
                  {quiet ? (
                    <time
                      dateTime={entry.dateTime}
                      className="block font-pixel text-[10px] uppercase tracking-[.16em] text-cream/40"
                    >
                      {date}
                    </time>
                  ) : (
                    <>
                      <time
                        dateTime={entry.dateTime}
                        className="block font-display text-[46px] leading-none font-extrabold tracking-[-.03em] text-paper"
                      >
                        {entry.year}
                      </time>
                      {date && (
                        <div className="mt-2.5 font-pixel text-[10px] uppercase tracking-[.16em] text-cream/55">
                          {date}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div
                  className={
                    quiet
                      ? "min-w-0 flex-[1_1_320px] border-l border-cream/14 pl-5"
                      : "min-w-0 flex-[1_1_320px]"
                  }
                >
                  <h3
                    className={
                      quiet
                        ? "font-pixel text-[10px] uppercase tracking-[.16em] text-cream/55"
                        : "mt-2 mb-2.5 text-xl leading-[1.3] font-semibold text-paper"
                    }
                  >
                    {t(`entries.${entry.id}.title`)}
                  </h3>
                  <p
                    className={
                      quiet
                        ? "mt-2.5 text-[15px] leading-[1.55] text-pretty text-cream/55"
                        : "text-pretty text-cream/74"
                    }
                  >
                    {t.rich(`entries.${entry.id}.body`, {
                      em: (chunks) => <em>{chunks}</em>,
                    })}
                  </p>
                  {entry.quote && (
                    <blockquote className="mt-[26px]">
                      <p className="font-display text-[clamp(22px,2.2vw,26px)] leading-[1.35] font-normal tracking-[-.01em] text-pretty text-paper">
                        {t(`quotes.${entry.quote}.text`)}
                      </p>
                      <footer className="mt-3 font-pixel text-[9px] uppercase tracking-[.16em] text-lime">
                        {t(`quotes.${entry.quote}.author`)}
                      </footer>
                    </blockquote>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
