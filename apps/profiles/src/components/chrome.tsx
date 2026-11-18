// Shared page chrome for every route this app serves (profile, not-found): the
// full-width top nav with the Zyron lockup and the hairline footer. Pure SSR.

import type { ReactNode } from "react";
import { ZyronLogo } from "@zyron/profile-ui/logo";
import { ThemeToggle } from "./ThemeToggle";

export function SiteNav() {
  return (
    <nav className="flex w-full items-center justify-between px-6 py-5 sm:px-8">
      <a href="https://zyron.site" className="flex items-center gap-2.5">
        <ZyronLogo className="h-[22px] w-auto" aria-label="Zyron" />
        <span className="font-display text-lg leading-none">Zyron</span>
      </a>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href="https://zyron.site/install"
          target="_blank"
          rel="noopener"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Get Zyron
        </a>
      </div>
    </nav>
  );
}

export function SiteFooter({ width = "max-w-[720px]" }: { width?: string }) {
  return (
    <footer className="border-t">
      <div
        className={`mx-auto flex w-full ${width} flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center sm:gap-4 sm:px-6`}
      >
        <p className="flex min-w-0 items-center gap-2 text-xs leading-relaxed text-muted-foreground/80">
          <ZyronLogo className="h-3.5 w-auto shrink-0 opacity-60" />
          <span>Built with Zyron — the open workspace for coding agents</span>
        </p>
        <a
          href="https://zyron.site"
          className="shrink-0 text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
        >
          zyron.site
        </a>
      </div>
    </footer>
  );
}

/** Nav + centered 720px column + footer — the frame both routes share. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-3 px-4 pb-16 pt-6 sm:px-0">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
