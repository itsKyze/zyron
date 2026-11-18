// FILE: whatsNew/FeatureSection.tsx
// Purpose: Render a single "What's new" feature card — title, description,
// optional screenshot, and an optional longer technical blurb. Matches the
// IndieDevs card layout so the post-update dialog and the Settings release
// history share one visual vocabulary.
// Layer: presentational — no state, no data fetching, no storage.

import { cn } from "~/lib/utils";

import type { WhatsNewFeature } from "./logic";

export interface FeatureSectionProps {
  readonly feature: WhatsNewFeature;
  readonly className?: string;
}

const BADGE_TONE_STYLES = {
  new: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  improved: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  fix: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  default: "border-primary/20 bg-primary/10 text-primary",
} as const;

/**
 * A single feature card inside a release. Rendered inside the dialog's
 * primary view and the changelog accordion's expanded panels.
 *
 * Layout rules:
 *   - Title + description at the top, always visible.
 *   - Image below when provided; we frame it in a rounded border and let the
 *     natural aspect ratio dictate height (no cropping).
 *   - Details text sits tight under the image as a compact
 *     muted blurb — think "release note footnote", not body copy.
 */
export function FeatureSection({ feature, className }: FeatureSectionProps) {
  const hasMedia = feature.image !== undefined || feature.details !== undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
            {feature.title}
          </h3>
          {feature.badge !== undefined && (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-ui-xs font-medium tracking-wide uppercase",
                BADGE_TONE_STYLES[feature.badgeTone ?? "new"],
              )}
            >
              {feature.badge}
            </span>
          )}
        </div>
        <p className="text-ui leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>
      {hasMedia && (
        <div className="flex flex-col gap-1.5">
          {feature.image !== undefined && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/40">
              <img
                src={feature.image}
                alt={feature.imageAlt ?? ""}
                className="h-auto w-full"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {feature.details !== undefined && (
            <p className="text-ui leading-relaxed text-muted-foreground/85">{feature.details}</p>
          )}
        </div>
      )}
    </div>
  );
}
