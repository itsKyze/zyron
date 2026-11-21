"use client";

import { useState } from "react";
import Link from "next/link";
import { LuCheck, LuArrowRight, LuSparkles, LuSmartphone, LuShieldCheck } from "react-icons/lu";

interface Tier {
  name: string;
  id: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  ctaVariant: "primary" | "secondary" | "outline";
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: "Community",
    id: "community",
    tagline: "Free & open-source desktop workspace for individual developers.",
    monthlyPrice: 0,
    annualPrice: 0,
    ctaText: "Download Zyron",
    ctaHref: "/install",
    ctaVariant: "secondary",
    features: [
      "100% Local-first desktop app (macOS, Linux, Windows)",
      "Bring Your Own Keys (Claude Code, Codex, OpenCode, Ollama)",
      "Unlimited agent sessions & parallel tabs",
      "Git worktree isolation & multi-agent swarms",
      "Native visual diff reviewer & integrated terminal",
      "Direct execution without third-party token markup",
      "Community GitHub and Discord support",
    ],
  },
  {
    name: "Zyron Pro",
    id: "pro",
    tagline: "Remote control companion & seamless multi-device workspace sync.",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    popular: true,
    ctaText: "Get Zyron Pro",
    ctaHref: "/install",
    ctaVariant: "primary",
    features: [
      "Everything in Community, plus:",
      "Zyron Remote: iOS & iPad companion app",
      "Real-time push notifications for command approvals",
      "End-to-end encrypted multi-device state sync",
      "Remote thought streaming & live terminal stdout",
      "Offline action queueing from your phone",
      "Priority background webhook & relay connectivity",
    ],
  },
  {
    name: "Enterprise",
    id: "enterprise",
    tagline: "Governance, self-hosted relay, and custom security for engineering teams.",
    monthlyPrice: 29,
    annualPrice: 24,
    ctaText: "Contact Us",
    ctaHref: "mailto:team@zyron.site",
    ctaVariant: "outline",
    features: [
      "Everything in Pro, plus:",
      "Self-hosted relay broker on your private VPC",
      "Centralized policy guardrails & command blocklists",
      "Enterprise SAML 2.0 / Okta / Azure AD SSO",
      "Audit logging & team compliance exports",
      "Custom SLAs & uptime guarantees (99.9%)",
      "Dedicated Slack/Discord private channel & engineer onboarding",
    ],
  },
];

const COMPARISON_ROWS = [
  {
    category: "Core Agent Experience",
    items: [
      {
        feature: "Local Desktop App (macOS, Windows, Linux)",
        community: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Bring Your Own API Keys (No token markup)",
        community: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Multi-Provider Swarms (Claude, Codex, Antigravity)",
        community: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Git Worktree Management & Diff Viewer",
        community: true,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Unlimited Parallel Agent Sessions",
        community: true,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Remote & Cloud Connectivity",
    items: [
      { feature: "Zyron Remote iOS Companion App", community: false, pro: true, enterprise: true },
      {
        feature: "Mobile Push Notification Approvals",
        community: false,
        pro: true,
        enterprise: true,
      },
      {
        feature: "Live Remote Terminal & Log Streaming",
        community: false,
        pro: true,
        enterprise: true,
      },
      { feature: "End-to-End Encrypted State Sync", community: false, pro: true, enterprise: true },
      {
        feature: "Offline Prompt & Session Queueing",
        community: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Security & Governance",
    items: [
      { feature: "Local Zero-Cloud Privacy Mode", community: true, pro: true, enterprise: true },
      { feature: "Noise Protocol E2EE Relay", community: false, pro: true, enterprise: true },
      {
        feature: "Self-Hosted Private Relay Server",
        community: false,
        communityText: "—",
        pro: false,
        proText: "—",
        enterprise: true,
      },
      {
        feature: "Custom SSO / SAML & Directory Sync",
        community: false,
        communityText: "—",
        pro: false,
        proText: "—",
        enterprise: true,
      },
      {
        feature: "Team Compliance & Command Audit Logs",
        community: false,
        communityText: "—",
        pro: false,
        proText: "—",
        enterprise: true,
      },
    ],
  },
];

export default function PricingTable() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="w-full">
      {/* Billing Switcher */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--divide)] bg-[var(--card)]/80 p-1 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${
              !isAnnual
                ? "bg-[var(--text-primary)] text-[var(--page-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${
              isAnnual
                ? "bg-[var(--text-primary)] text-[var(--page-bg)] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <span>Annual billing</span>
            <span className="rounded-full bg-[var(--accent-link)] px-2 py-0.5 text-[10.5px] font-semibold text-white shadow-sm">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-200 sm:p-8 ${
                tier.popular
                  ? "border-[var(--accent-link)]/60 bg-[var(--card)] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-[var(--accent-link)]/30"
                  : "border-[var(--divide)] bg-[var(--card)]/60 hover:border-[var(--text-tertiary)]/40 hover:bg-[var(--card)]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-link)]/40 bg-[var(--accent-link)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white shadow-sm">
                    <LuSparkles className="size-3" />
                    Recommended
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.25rem] font-medium tracking-tight text-[var(--text-primary)]">
                    {tier.name}
                  </h3>
                  {tier.id === "pro" && (
                    <span className="rounded-md border border-[var(--divide)] bg-[var(--mock-row)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                      Mobile & Sync
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                  {tier.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-[2.25rem] font-medium tracking-tight text-[var(--text-primary)]">
                    ${price}
                  </span>
                  {tier.monthlyPrice > 0 ? (
                    <span className="text-[13px] text-[var(--text-tertiary)]">
                      / seat / month {isAnnual ? "(billed annually)" : ""}
                    </span>
                  ) : (
                    <span className="text-[13px] text-[var(--text-tertiary)]">free forever</span>
                  )}
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3 border-t border-[var(--divide)] pt-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug">
                      <LuCheck className="mt-0.5 size-4 shrink-0 text-[var(--accent-link)]" />
                      <span className="text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={tier.ctaHref}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.985] active:translate-y-[0.5px] ${
                    tier.ctaVariant === "primary"
                      ? "bg-[var(--accent-link)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:brightness-105"
                      : tier.ctaVariant === "secondary"
                        ? "border border-[var(--divide)] bg-[var(--text-primary)] text-[var(--page-bg)] hover:opacity-90"
                        : "border border-[var(--divide)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--mock-row)]"
                  }`}
                >
                  {tier.ctaText}
                  <LuArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <section className="mt-20">
        <div className="text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Compare plans
          </p>
          <h2 className="mt-2 text-[1.5rem] font-medium tracking-tight text-[var(--text-primary)] sm:text-[1.75rem]">
            Detailed feature breakdown
          </h2>
          <p className="mt-2 text-[13.5px] text-[var(--text-secondary)]">
            Everything you get with Zyron Community, Pro, and Enterprise.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-[var(--divide)] bg-[var(--card)]/40 p-4 sm:p-6">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--divide)] text-[13px] font-medium text-[var(--text-secondary)]">
                <th className="pb-4 pt-2 font-normal text-[var(--text-tertiary)]">Feature</th>
                <th className="pb-4 pt-2 text-center font-medium text-[var(--text-primary)]">
                  Community
                </th>
                <th className="pb-4 pt-2 text-center font-medium text-[var(--accent-link)]">
                  Zyron Pro
                </th>
                <th className="pb-4 pt-2 text-center font-medium text-[var(--text-primary)]">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((group, groupIndex) => (
                <div key={groupIndex} className="contents">
                  <tr className="border-b border-[var(--divide)]/60 bg-[var(--mock-row)]/40">
                    <td
                      colSpan={4}
                      className="py-3 px-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-[var(--divide)]/40 text-[13px] transition-colors hover:bg-[var(--mock-row)]/30"
                    >
                      <td className="py-3.5 px-2 text-[var(--text-secondary)]">{row.feature}</td>
                      <td className="py-3.5 text-center">
                        {typeof row.community === "boolean" ? (
                          row.community ? (
                            <LuCheck className="mx-auto size-4 text-[var(--text-primary)]" />
                          ) : (
                            <span className="text-[var(--text-tertiary)]">—</span>
                          )
                        ) : (
                          <span className="text-[var(--text-tertiary)]">{row.communityText}</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <LuCheck className="mx-auto size-4 text-[var(--accent-link)]" />
                          ) : (
                            <span className="text-[var(--text-tertiary)]">—</span>
                          )
                        ) : (
                          <span className="text-[var(--text-tertiary)]">{row.proText}</span>
                        )}
                      </td>
                      <td className="py-3.5 text-center">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <LuCheck className="mx-auto size-4 text-[var(--text-primary)]" />
                          ) : (
                            <span className="text-[var(--text-tertiary)]">—</span>
                          )
                        ) : (
                          <span className="text-[var(--text-tertiary)]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </div>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
