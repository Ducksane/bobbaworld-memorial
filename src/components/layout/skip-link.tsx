import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("Layout");

  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-lime focus:px-5 focus:py-3 focus:text-[15px] focus:font-semibold focus:text-moss"
    >
      {t("skipToContent")}
    </a>
  );
}
