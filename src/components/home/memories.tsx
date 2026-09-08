import { useTranslations } from "next-intl";
import { Reveal } from "@/components/effects/reveal";
import { Container } from "@/components/ui/container";
import { PixelLabel } from "@/components/ui/pixel-label";
import { GHOST_AVATAR, memories } from "@/content/memories";

/** Masonry wall of player memories, laid out by CSS multi-column. */
export function Memories() {
  const t = useTranslations("Memories");

  return (
    <section id="souvenirs">
      <Container className="pt-[140px] pb-10">
        <div className="mb-12">
          <PixelLabel className="mb-[18px] text-[11px] tracking-[.18em] text-lime">
            {t("label")}
          </PixelLabel>
          <h2 className="font-display text-[clamp(30px,4vw,48px)] leading-[1.02] font-bold tracking-[-.03em] text-balance text-paper">
            {t("title")}
          </h2>
          <p className="mt-[18px] max-w-[540px] text-[15px] leading-[1.55] text-pretty text-cream/62">
            {t("intro")}
          </p>
        </div>

        {/* `columns: 3 300px` — three columns, collapsing as the cards hit 300px. */}
        <div className="columns-[3_300px] gap-x-5">
          {memories.map((memory) => (
            <Reveal key={memory.id} className="mb-5 break-inside-avoid">
              <figure className="flex flex-col gap-5 border border-cream/12 bg-[linear-gradient(180deg,rgba(236,232,220,.045),rgba(236,232,220,.015))] px-[26px] pt-[26px] pb-6 transition-colors duration-300 hover:border-lime/50">
                <span
                  aria-hidden
                  className="-mb-3.5 font-display text-[64px] leading-[.6] font-extrabold tracking-[-.04em] text-lime"
                >
                  &ldquo;
                </span>
                <blockquote className="text-[17px] leading-[1.6] text-pretty text-cream/86">
                  {t(`entries.${memory.id}`)}
                </blockquote>
                <figcaption className="flex items-center gap-3.5 border-t border-cream/10 pt-[18px]">
                  <span className="flex size-16 flex-none items-end justify-center overflow-hidden rounded-full border border-lime/35 bg-[radial-gradient(circle_at_50%_35%,rgba(108,194,74,.28),rgba(46,196,196,.10)_60%,rgba(5,11,22,0))]">
                    {/* `next/image` needs intrinsic dimensions; habbo-imaging returns
                        whatever the figure string implies, and resizing would smear the
                        pixel art. The design scales by height alone and lets the
                        negative margin crop the legs off. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={memory.avatar ?? GHOST_AVATAR}
                      alt=""
                      loading="lazy"
                      className="-mb-[38px] block h-24 w-auto max-w-none [image-rendering:pixelated]"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <cite className="truncate text-[15px] font-semibold not-italic text-paper">
                      {memory.pseudo}
                    </cite>
                    <span className="font-pixel text-[9px] uppercase tracking-[.16em] text-cream/55">
                      {memory.year
                        ? t("roleWithYear", {
                            gender: memory.gender ?? "male",
                            year: memory.year,
                          })
                        : t("role", { gender: memory.gender ?? "male" })}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
