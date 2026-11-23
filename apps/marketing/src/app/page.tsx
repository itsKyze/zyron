// FILE: page.tsx
// Purpose: Public marketing homepage for Zyron.
// Layer: App Router page (server component)

import { SiGithub, SiOpenai } from "react-icons/si";
import Navbar from "@/components/Navbar";
import DownloadButton from "@/components/DownloadButton";
import InstallerCount from "@/components/InstallerCount";
import Features from "@/components/Features";
import Workflow from "@/components/Workflow";
import FAQ from "@/components/FAQ";
import AskAISection from "@/components/AskAISection";
import Testimonials from "@/components/Testimonials";
import ClosingCTA from "@/components/ClosingCTA";
import SiteFooter from "@/components/SiteFooter";
import PrivacySection from "@/components/PrivacySection";
import HomepageRail from "@/components/HomepageRail";
import {
  AntigravityIcon,
  ClaudeIcon,
  OpencodeIcon,
  CursorIcon,
  DevinIcon,
  GrokIcon,
  PiIcon,
  DroidIcon,
} from "@/components/BrandIcons";
import { getInstallerCount } from "@/lib/installerCount";
import { PRODUCT_HERO_DESCRIPTION, PRODUCT_HERO_TITLE } from "@/data/product";
import { FAQ_JSONLD, GITHUB_REPO_URL, jsonLdScript } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const installerCount = await getInstallerCount();

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--page-bg)] text-[var(--text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(FAQ_JSONLD) }}
      />
      <Navbar />

      <main>
        <section
          id="overview"
          aria-labelledby="homepage-title"
          className="hero-section relative scroll-mt-20 overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20"
        >
          {/* Ace Studio style ambient backdrop glow & subtle dot pattern */}
          <div
            className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--text-primary)_9%,transparent),transparent_70%)]"
            aria-hidden="true"
          />
          <div
            className="ace-dots-bg pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div
              className="pm-enter mb-8 flex flex-wrap items-center gap-2.5 sm:mb-10"
              style={{ "--pm-i": 0 } as React.CSSProperties}
            >
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <ClaudeIcon className="size-[20px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <SiOpenai className="size-[19px] text-[var(--text-primary)]" aria-hidden="true" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <OpencodeIcon className="size-[20px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <CursorIcon className="size-[19px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <AntigravityIcon className="size-[20px]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <GrokIcon className="size-[19px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <DevinIcon className="size-[19px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <PiIcon className="size-[19px] text-[var(--text-primary)]" />
              </div>
              <div className="inline-flex size-[40px] items-center justify-center rounded-2xl border border-black/[0.08] bg-black/[0.03] shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]">
                <DroidIcon className="size-[19px] text-[var(--text-primary)]" />
              </div>
            </div>

            <h1
              id="homepage-title"
              className="pm-enter text-[1.5rem] font-medium leading-[1.12] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[2rem] sm:leading-[1.08]"
              style={{ "--pm-i": 1 } as React.CSSProperties}
            >
              {PRODUCT_HERO_TITLE}
            </h1>
            {/* data-live-hero-color: rendered in the LIVE site's exact colors
                (Kartik: hero matches production pixel-for-pixel). Those mandated
                colors are under the 4.5:1 AA threshold on the page background, so
                the a11y suite excludes these two elements from color-contrast. */}
            <p
              data-live-hero-color="true"
              className="pm-enter mt-5 text-[13px] leading-[1.6] text-[color-mix(in_oklab,var(--text-primary)_58%,transparent)] dark:text-[color-mix(in_oklab,var(--text-primary)_55%,transparent)] sm:text-[14px]"
              style={{ "--pm-i": 2 } as React.CSSProperties}
            >
              {PRODUCT_HERO_DESCRIPTION}
            </p>

            <div
              className="pm-enter mt-9 flex flex-wrap items-center gap-3"
              data-home-actions
              style={{ "--pm-i": 3 } as React.CSSProperties}
            >
              <DownloadButton />
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--divide)] px-5 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--mock-row)] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-link)]"
              >
                <SiGithub className="size-4 shrink-0" aria-hidden="true" />
                Star on GitHub
              </a>
            </div>
            <p
              data-live-hero-color="true"
              className="pm-enter mt-4 text-[12px] text-[color-mix(in_oklab,var(--text-primary)_42%,transparent)] dark:text-[color-mix(in_oklab,var(--text-primary)_38%,transparent)]"
              style={{ "--pm-i": 4 } as React.CSSProperties}
            >
              <InstallerCount initialCount={installerCount} />
            </p>

            <div
              className="pm-enter relative mt-10 sm:mt-14"
              data-hero-preview
              style={{ "--pm-i": 5 } as React.CSSProperties}
            >
              {/* Luxury ambient backdrop aura */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-black/5 blur-2xl dark:bg-white/[0.03]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-black/[0.08] to-transparent dark:from-white/20 sm:rounded-2xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-xl border border-black/10 bg-[var(--block-elevated)] p-1.5 shadow-2xl backdrop-blur-md dark:border-white/10 dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] sm:rounded-2xl sm:p-2.5">
                {/* macOS styled window toolbar */}
                <div className="mb-1.5 flex items-center justify-between px-2 pt-1 sm:mb-2 sm:px-3 sm:pt-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-foreground/25 sm:size-3 dark:bg-white/20" />
                    <span className="size-2.5 rounded-full bg-foreground/25 sm:size-3 dark:bg-white/20" />
                    <span className="size-2.5 rounded-full bg-foreground/25 sm:size-3 dark:bg-white/20" />
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-tertiary)] select-none sm:text-[12px]">
                    <span className="inline-block size-1.5 rounded-full bg-foreground/50 animate-pulse dark:bg-white/60" />
                    <span>Zyron · Command Center</span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-tertiary)] select-none">
                    v1.6
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/zyron-ui-light.png"
                  alt="Zyron — local-first command center for parallel coding agents, terminals, previews, diffs, and Git worktrees"
                  className="block h-auto w-full rounded-lg dark:hidden sm:rounded-xl"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/zyron-ui-dark.png"
                  alt="Zyron — local-first command center for parallel coding agents, terminals, previews, diffs, and Git worktrees"
                  className="hidden h-auto w-full rounded-lg dark:block sm:rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <div id="providers" className="scroll-mt-20">
          <Features />
        </div>
        <div id="workflow" className="scroll-mt-20">
          <Workflow />
        </div>
        <div id="privacy" className="scroll-mt-20">
          <PrivacySection />
        </div>

        <AskAISection />

        <FAQ />
        <Testimonials />
        <div id="download" className="scroll-mt-20">
          <ClosingCTA initialInstallerCount={installerCount} />
        </div>
      </main>

      <SiteFooter />
      <HomepageRail />
    </div>
  );
}
