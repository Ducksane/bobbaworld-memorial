import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async (params) => {
  // Only set when explicitly passed (e.g. getTranslations({locale})).
  let locale = params.locale;

  if (!locale) {
    // Inside `[locale]` the root segment supplies it and rendering stays static.
    // `global-not-found` renders outside that segment, so fall back to the header
    // set by the proxy — reading it opts that route into dynamic rendering, which
    // is why `requestLocale` is only touched once the root param comes up empty.
    const resolved = (await rootParams.locale()) ?? (await params.requestLocale);
    if (!hasLocale(routing.locales, resolved)) notFound();
    locale = resolved;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
