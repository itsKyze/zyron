// FILE: remote/page.tsx
// Purpose: Zyron Remote (iOS/iPad companion app) showcase and pairing instructions.
// Layer: App Router page (static)

import Link from "next/link";
import {
  LuSmartphone,
  LuBell,
  LuTerminal,
  LuShieldCheck,
  LuQrCode,
  LuCheck,
  LuArrowRight,
  LuWifi,
  LuLock,
} from "react-icons/lu";
import Navbar from "@/components/Navbar";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import SiteFooter from "@/components/SiteFooter";
import { breadcrumbJsonLd, jsonLdScript, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Zyron Remote — iOS & iPad Companion",
  description:
    "Control your AI coding agents from your pocket. Approve bash commands, review diffs, and stream terminal logs in real-time from your iPhone or iPad.",
  path: "/remote",
});

const REMOTE_JSONLD = [
  breadcrumbJsonLd([
    { name: "Zyron", path: "/" },
    { name: "Remote", path: "/remote" },
  ]),
];

const FEATURES = [
  {
    icon: LuBell,
    title: "Lock Screen Push Approvals",
    description:
      "When your agent runs sensitive commands like `rm -rf` or initiates git commits, receive a rich push notification on your iPhone or Apple Watch and approve with one tap.",
  },
  {
    icon: LuTerminal,
    title: "Real-Time Terminal Streaming",
    description:
      "Follow agent thought streams, markdown task checklists, and live terminal stdout with ultra-low latency WebSocket streaming.",
  },
  {
    icon: LuQrCode,
    title: "Instant QR Pairing",
    description:
      "Pair your phone to your desktop in seconds by scanning a dynamic QR code. No accounts, no email logins, zero configuration.",
  },
  {
    icon: LuShieldCheck,
    title: "End-to-End Encrypted",
    description:
      "Direct encrypted peer connection secured with modern cryptographic keys. Your workspace source code is never read or stored on external servers.",
  },
];

export default function RemotePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-[var(--text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(REMOTE_JSONLD) }}
      />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        {/* Hero Section */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <SectionEyebrow as="p">Zyron Remote for iOS</SectionEyebrow>
            <h1 className="mt-3 text-[1.85rem] font-medium leading-[1.15] tracking-[-0.035em] sm:text-[2.6rem]">
              Control your agent workspace from your pocket.
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
              Leave long-running agent workflows running on your workstation while you step away.
              Review terminal diffs, approve dangerous bash actions, and monitor live progress
              directly on your iPhone.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/install"
                className="flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-6 py-2.5 text-[13px] font-medium text-[var(--page-bg)] shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:opacity-90 active:scale-[0.985] active:translate-y-[0.5px]"
              >
                <LuSmartphone className="size-4" />
                <span>Get Zyron Remote</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center gap-2 rounded-full border border-[var(--divide)] bg-[var(--card)] px-5 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--mock-row)] active:scale-[0.985] active:translate-y-[0.5px]"
              >
                <span>Read Remote Docs</span>
                <LuArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-4 text-[12px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1.5">
                <LuLock className="size-3.5 text-[var(--accent-link)]" />
                Zero-knowledge E2EE
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <LuWifi className="size-3.5 text-[var(--accent-link)]" />
                Direct local Wi-Fi & Cloud relay
              </span>
            </div>
          </div>

          {/* Interactive Phone Mockup */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative w-full max-w-[320px] rounded-[44px] border-[6px] border-[var(--divide)] bg-[var(--card)] p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">
              {/* Dynamic Island / Notch */}
              <div className="mx-auto mb-4 h-4 w-28 rounded-full bg-black/[0.15] dark:bg-white/[0.15]" />

              {/* Mockup Screen Header */}
              <div className="flex items-center justify-between border-b border-[var(--divide)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[var(--text-primary)] animate-pulse" />
                  <span className="text-[12px] font-medium text-[var(--text-primary)]">
                    Zyron Studio
                  </span>
                </div>
                <span className="rounded-md border border-[var(--divide)] bg-[var(--mock-row)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                  Claude Code
                </span>
              </div>

              {/* Active Agent Task Card */}
              <div className="mt-4 rounded-2xl border border-[var(--divide)] bg-[var(--page-bg)] p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--accent-link)]">
                    TASK IN PROGRESS
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">Step 4/6</span>
                </div>
                <p className="mt-1 text-[12.5px] font-medium text-[var(--text-primary)]">
                  Refactor auth token refresh loop
                </p>
                <div className="mt-2.5 space-y-1.5 font-mono text-[10.5px] text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                    <LuCheck className="size-3" />
                    <span>packages/server/auth.ts (updated)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                    <LuCheck className="size-3" />
                    <span>bun run typecheck passed</span>
                  </div>
                </div>
              </div>

              {/* Pending Action Approval Card */}
              <div className="mt-3.5 rounded-2xl border border-[var(--divide)] bg-[var(--mock-row)] p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-primary)]">
                  <LuBell className="size-3.5" />
                  <span>APPROVAL REQUIRED</span>
                </div>
                <p className="mt-1 text-[11.5px] text-[var(--text-primary)]">
                  Execute shell command on workstation?
                </p>
                <div className="mt-1.5 rounded-lg bg-black/10 dark:bg-black/30 p-2 font-mono text-[10.5px] text-[var(--text-secondary)]">
                  git push origin fix/auth-token
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--divide)] bg-[var(--card)] py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--mock-row)]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[var(--text-primary)] py-1.5 text-[11px] font-medium text-[var(--page-bg)] shadow-sm hover:opacity-90"
                  >
                    Approve
                  </button>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-black/20 dark:bg-white/20" />
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mt-24 border-t border-[var(--divide)] pt-16">
          <div className="text-center">
            <SectionEyebrow as="p">Key Features</SectionEyebrow>
            <h2 className="mt-2 text-[1.5rem] font-medium tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              Engineered for developer velocity
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[13.5px] text-[var(--text-secondary)]">
              Stay in the flow without being tied to your desk.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-[var(--divide)] bg-[var(--card)]/50 p-6 transition-all duration-200 hover:border-[var(--accent-link)]/40 hover:bg-[var(--card)]"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--divide)] bg-[var(--page-bg)] text-[var(--accent-link)] shadow-sm">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-[14px] font-medium text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Step Setup */}
        <section className="mt-24 rounded-3xl border border-[var(--divide)] bg-[var(--card)]/60 p-8 sm:p-12">
          <SectionEyebrow>Setup in 30 seconds</SectionEyebrow>
          <h2 className="mt-2 text-[1.5rem] font-medium tracking-tight text-[var(--text-primary)] sm:text-[1.75rem]">
            How to pair Zyron Remote
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-[2rem] font-bold text-[var(--accent-link)]">01</span>
              <h3 className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
                Launch Zyron Desktop
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Open Zyron on your Mac, Linux, or Windows workstation and click the Remote icon in
                the status bar.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-[2rem] font-bold text-[var(--accent-link)]">02</span>
              <h3 className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
                Scan the Pairing QR
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Open Zyron Remote on iOS and point your camera at the QR code for an instant
                zero-trust handshake.
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-[2rem] font-bold text-[var(--accent-link)]">03</span>
              <h3 className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
                Approve & Ship
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Step away with confidence. Your iPhone will vibrate whenever the agent needs
                approval or finishes a task.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
