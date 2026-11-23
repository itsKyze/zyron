// FILE: data/testimonials.ts
// Purpose: Canonical list of Zyron testimonials sourced from X (Twitter) posts.
// Layer: Static data
// Notes: Each entry is keyed by its tweet id. The live tweet (author, avatar,
//        full text, likes, media) is fetched at render time via lib/tweets.ts —
//        mirroring the link-manager tweet pipeline — so the "Anonymous" / trimmed
//        rows from the original spreadsheet resolve to their real authors. The
//        fallback fields below keep the wall populated if a fetch ever fails.

export type TestimonialTier = 1 | 2 | 3;

export interface TestimonialSeed {
  /** Numeric X status id — the only thing react-tweet needs to resolve a post. */
  id: string;
  /** Curation tier (1 = strongest social proof). Drives ordering. */
  tier: TestimonialTier;
  /** Handle to show if the live tweet cannot be fetched. */
  fallbackHandle: string;
  /** Text to show if the live tweet cannot be fetched. */
  fallbackText: string;
  /** Permalink, used for the fallback "view on X" link. */
  fallbackUrl: string;
  /**
   * Optional English translation, shown (with a "Translated from …" label) in
   * place of the original. react-tweet returns only the original-language text,
   * so the translation is supplied here.
   */
  translation?: string;
  /** Source language code of the original tweet (e.g. "zh"), for the label. */
  translationLang?: string;
}

// Ordered strongest-first; the section renders them as a single masonry wall.
export const TESTIMONIALS: TestimonialSeed[] = [];
