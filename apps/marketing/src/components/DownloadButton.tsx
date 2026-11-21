// FILE: DownloadButton.tsx
// Purpose: OS-aware hero CTA that routes to the installer page.
// Layer: Client component

"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LuArrowDownToLine } from "react-icons/lu";
import { detectOS, type OS } from "@/lib/platform";

const LABEL: Record<OS, string> = {
  mac: "Download for macOS",
  windows: "Download for Windows",
  linux: "Download for Linux",
  unknown: "Download Zyron",
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: { platform?: string };
};

type DownloadButtonProps = {
  className?: string;
};

export default function DownloadButton({ className = "" }: DownloadButtonProps) {
  const label = useSyncExternalStore(
    () => () => undefined,
    () => {
      const nav = navigator as NavigatorWithUserAgentData;
      return LABEL[
        detectOS(navigator.userAgent, nav.userAgentData?.platform ?? navigator.platform)
      ];
    },
    () => LABEL.unknown,
  );

  return (
    <Link
      href="/install"
      className={`group inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-full bg-[var(--btn-primary-bg)] px-5 py-2.5 text-[13px] font-medium text-[var(--btn-primary-fg)] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_0.5px_rgba(255,255,255,0.2)] transition-all duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:brightness-110 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.08),inset_0_1px_0.5px_rgba(255,255,255,0.25)] active:scale-[0.98] active:translate-y-[0.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-link)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0.5px_rgba(255,255,255,0.15)] ${className}`}
    >
      <span className="whitespace-nowrap">{label}</span>
      <LuArrowDownToLine
        className="size-4 shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-y-[1.5px]"
        aria-hidden="true"
      />
    </Link>
  );
}
