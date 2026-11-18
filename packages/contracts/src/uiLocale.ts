/** Supported UI locales; catalogs live under `packages/shared/src/locales/{locale}`. */
export const UI_LOCALES = ["en", "ar"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];
