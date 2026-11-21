// FILE: donors/page.tsx
// Purpose: Community Donors & Backers wall celebrating individual and corporate supporters.
// Layer: App Router page (static)

import Link from "next/link";
import { LuArrowUpRight, LuHeart, LuSparkles } from "react-icons/lu";
import Navbar from "@/components/Navbar";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import SiteFooter from "@/components/SiteFooter";
import { SponsorRow } from "@/components/SponsorRow";
import { SPONSORS } from "@/data/sponsors";
import { ctaButtonClass } from "@/lib/ctaButton";
import { groupSponsors, orderedSponsors, sponsorLink } from "@/lib/sponsors";
import {
  GITHUB_SPONSORS_URL,
  breadcrumbJsonLd,
  jsonLdScript,
  pageMetadata,
  sponsorsPageJsonLd,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Donors & Backers — Zyron",
  description:
    "Honoring the developers and organizations funding Zyron, the free and open-source coding agent workspace. Thank you to all donors and contributors.",
  path: "/donors",
});

const ORDERED_SPONSORS = orderedSponsors(SPONSORS);

const DONORS_JSONLD = [
  sponsorsPageJsonLd(
    ORDERED_SPONSORS.map((sponsor) => ({
      name: sponsor.name,
      url: sponsorLink(sponsor),
    })),
  ),
  breadcrumbJsonLd([
    { name: "Zyron", path: "/" },
    { name: "Donors", path: "/donors" },
  ]),
];

export default function DonorsPage() {
  const groups = groupSponsors(ORDERED_SPONSORS);
  const count = ORDERED_SPONSORS.length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-[var(--text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(DONORS_JSONLD) }}
      />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header>
          <SectionEyebrow as="p">Community Backers</SectionEyebrow>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h1 className="text-[1.35rem] font-medium leading-[1.2] tracking-[-0.03em] sm:text-[1.5rem]">
              The people and teams funding Zyron
            </h1>
            <span className="font-mono text-[12px] text-[var(--text-tertiary)]">
              {count} {count === 1 ? "supporter" : "supporters"}
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-[1.65] text-[var(--text-secondary)]">
            Zyron is 100% free, MIT licensed, and independent. Every dollar donated directly funds
            code signing certificates, high-frequency continuous integration, and open source
            maintenance. Thank you to everyone helping keep Zyron sustainable.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={GITHUB_SPONSORS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={ctaButtonClass({ variant: "primary", width: "responsive" })}
            >
              <LuHeart className="size-4" aria-hidden="true" />
              Become a supporter
            </a>
            <Link
              href="/sponsor"
              className={ctaButtonClass({ variant: "secondary", width: "responsive" })}
            >
              View funding tiers
              <LuArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {groups.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-[var(--divide)] bg-[var(--card)]/40 p-8 text-center">
            <LuHeart className="mx-auto size-8 text-[var(--accent-link)]" />
            <h3 className="mt-3 text-[14px] font-medium text-[var(--text-primary)]">
              Be the first backer
            </h3>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              Join GitHub Sponsors and have your avatar and link featured here.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-10">
            {groups.map((group) => (
              <section key={group.id}>
                <div className="flex items-baseline justify-between border-b border-[var(--divide)] pb-2">
                  <SectionEyebrow>{group.title}</SectionEyebrow>
                </div>
                <ul className="mt-3 flex max-w-lg flex-col divide-y divide-[var(--divide)]/50">
                  {group.sponsors.map((sponsor) => (
                    <li key={sponsor.login}>
                      <SponsorRow sponsor={sponsor} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
