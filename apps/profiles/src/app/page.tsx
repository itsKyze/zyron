"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZyronLogo } from "@zyron/profile-ui/logo";
import { PageShell } from "../components/chrome";

export default function ProfileLandingPage() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, "");
    if (clean) {
      router.push(`/@${clean}`);
    }
  };

  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border bg-card/60 p-3 shadow-sm backdrop-blur">
          <ZyronLogo className="size-10" />
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Zyron Developer Profiles
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          Explore developer activity, coding agent sessions, and public stats across the Zyron ecosystem.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-sm items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="username"
              className="w-full rounded-xl border bg-background/80 py-2.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm transition focus:border-foreground/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 shadow-sm"
          >
            View
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Popular:</span>
          <button
            type="button"
            onClick={() => router.push("/@kyze")}
            className="rounded-md border bg-muted/50 px-2 py-0.5 text-foreground/80 hover:bg-muted transition"
          >
            @kyze
          </button>
        </div>
      </div>
    </PageShell>
  );
}
