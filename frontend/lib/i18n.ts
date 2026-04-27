import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "es", "fr", "zh"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  return {
    locale: locale || defaultLocale,
    messages: (await import(`../messages/${locale || defaultLocale}.json`))
      .default,
  };
});
