// FILE: pricing/page.tsx
// Purpose: Pricing and tiers page for Zyron Community, Pro, and Enterprise.
// Layer: App Router page (static)

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import SiteFooter from "@/components/SiteFooter";
import PricingTable from "@/components/PricingTable";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Pricing — Zyron",
  description:
    "Zyron Desktop is 100% free and open-source under the MIT license. Upgrade to Zyron Pro for the iOS remote companion app, mobile push approvals, and encrypted multi-device sync.",
  path: "/pricing",
});

const PRICING_FAQS = [
  {
    q: "Is Zyron really free and open-source?",
    a: "Yes. Zyron Desktop is 100% open source under the MIT license. You can download, inspect, build from source, and use it freely forever with no hidden paywalls or forced telemetry.",
  },
  {
    q: "Do I have to pay for AI tokens through Zyron?",
    a: "No! Zyron uses a Bring-Your-Own-Key (BYOK) architecture. You connect your existing Claude Code, Codex, OpenAI, or Ollama credentials directly. You pay model providers for your raw usage at standard rates with zero markup from Zyron.",
  },
  {
    q: "What does Zyron Pro include?",
    a: "Zyron Pro unlocks the Zyron Remote companion for iOS and iPad. It enables real-time push notifications to approve bash commands from anywhere, seamless encrypted multi-device session sync, and background task monitoring while away from your desk.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time with a single click. Your access will remain active until the end of your current billing period.",
  },
  {
    q: "How does the Enterprise tier work?",
    a: "Enterprise provides a dedicated, self-hosted relay broker for teams requiring complete VPC containment, SAML 2.0 / Okta SSO, custom compliance audit logs, and priority SLA support.",
  },
];

const PRICING_JSONLD = [
  breadcrumbJsonLd([
    { name: "Zyron", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]),
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-[var(--text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(PRICING_JSONLD) }}
      />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <header className="text-center">
          <SectionEyebrow as="p">Pricing & Plans</SectionEyebrow>
          <h1 className="mt-2.5 text-[1.65rem] font-medium leading-[1.2] tracking-[-0.03em] sm:text-[2.25rem]">
            Free forever. Supercharged with Remote.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-[1.65] text-[var(--text-secondary)]">
            Zyron Desktop is fully open source. Pay only if you want our iOS companion app,
            real-time push approvals, and multi-device encrypted sync.
          </p>
        </header>

        <section className="mt-8">
          <PricingTable />
        </section>

        {/* Pricing FAQ Section */}
        <section className="mt-24 border-t border-[var(--divide)] pt-16">
          <div className="max-w-2xl">
            <SectionEyebrow>Common Questions</SectionEyebrow>
            <h2 className="mt-2 text-[1.5rem] font-medium tracking-tight text-[var(--text-primary)]">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-[13.5px] text-[var(--text-secondary)]">
              Everything you need to know about billing, licensing, and keys.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRICING_FAQS.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[var(--divide)] bg-[var(--card)]/40 p-5 transition-colors hover:border-[var(--divide)]/80"
              >
                <h3 className="text-[14px] font-medium text-[var(--text-primary)]">{faq.q}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing Banner */}
        <div className="mt-20 rounded-3xl border border-[var(--divide)] bg-[var(--card)]/70 p-8 text-center backdrop-blur-md sm:p-12">
          <h2 className="text-[1.5rem] font-medium tracking-tight text-[var(--text-primary)]">
            Start building with Zyron today
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-[var(--text-secondary)]">
            Download the desktop client for free or sponsor development on GitHub.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/install"
              className="rounded-full bg-[var(--text-primary)] px-6 py-2.5 text-[13px] font-medium text-[var(--page-bg)] transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:opacity-90 active:scale-[0.985] active:translate-y-[0.5px]"
            >
              Download Desktop
            </Link>
            <Link
              href="/sponsor"
              className="rounded-full border border-[var(--divide)] bg-[var(--card)] px-6 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--mock-row)] active:scale-[0.985] active:translate-y-[0.5px]"
            >
              Sponsor on GitHub
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
