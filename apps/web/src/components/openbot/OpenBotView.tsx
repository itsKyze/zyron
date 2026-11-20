// FILE: OpenBotView.tsx
// Purpose: OpenBot coworkers surface inside Zyron - self-hostable AI coworkers with browser automation, tools, and multi-agent coordination.
// Layer: Web route view component

import { useState } from "react";
import { RouteInsetSurface } from "../RouteInsetSurface";
import { RouteSurface, RouteSurfaceHeader } from "../RouteSurface";
import { Button } from "~/components/ui/button";
import { BotIcon, ExternalLinkIcon, PlayIcon, CheckIcon } from "~/lib/icons";
import { openExternalLink } from "~/lib/linkChips";
import { cn } from "~/lib/utils";

interface CoworkerPreset {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: readonly string[];
  status: "idle" | "ready" | "connected";
}

const DEFAULT_COWORKERS: CoworkerPreset[] = [
  {
    id: "browser-agent",
    name: "Web Navigator",
    role: "Browser Automation",
    description:
      "Autonomously researches documentation, checks live web applications, and extracts structured datasets.",
    capabilities: ["Web Scraping", "Form Filling", "Human Approval"],
    status: "ready",
  },
  {
    id: "fullstack-coworker",
    name: "Code Reviewer",
    role: "Fullstack Assistant",
    description:
      "Reviews commits, drafts pull requests, verifies test coverage, and enforces repository best practices.",
    capabilities: ["Git Audits", "Test Verification", "Diff Inspection"],
    status: "ready",
  },
  {
    id: "research-bot",
    name: "Deep Researcher",
    role: "Knowledge Synthesis",
    description:
      "Synthesizes multi-source briefs, compares vendor benchmarks, and indexes internal documentation.",
    capabilities: ["Multi-source Query", "Report Export", "Citation Tracking"],
    status: "ready",
  },
];

const OPENBOT_BASE_URL = "http://127.0.0.1:3001";
const OPENBOT_INSTALL_TOKEN = "1b51c90286b2846212078c0f544eb35697b82fc092cf628312b8a6f9f1d9de4a";
const OPENBOT_AUTH_URL = `${OPENBOT_BASE_URL}/api/install/enter?token=${OPENBOT_INSTALL_TOKEN}&to=/`;

export default function OpenBotView() {
  const [openBotAppUrl] = useState(OPENBOT_AUTH_URL);
  const [openBotServerUrl, setOpenBotServerUrl] = useState(OPENBOT_BASE_URL);
  const [isConnected, setIsConnected] = useState(false);
  const [viewMode, setViewMode] = useState<"app" | "catalog">("app");
  const [activeBot, setActiveBot] = useState<string>("browser-agent");

  return (
    <RouteInsetSurface>
      <RouteSurface>
        <RouteSurfaceHeader>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-ui font-medium text-foreground">OpenBot Workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={viewMode === "app" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("app")}
                className="h-7 px-2.5 text-ui-xs"
              >
                Live App
              </Button>
              <Button
                type="button"
                variant={viewMode === "catalog" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("catalog")}
                className="h-7 px-2.5 text-ui-xs"
              >
                Coworkers & Hub
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openExternalLink(openBotAppUrl)}
              className="gap-1.5 h-8"
            >
              <span>Open in Browser</span>
              <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </RouteSurfaceHeader>

        {viewMode === "app" ? (
          <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
            <iframe
              src={openBotAppUrl}
              title="OpenBot Application"
              className="w-full h-full border-none bg-background"
              allow="clipboard-read; clipboard-write; microphone; camera; autoplay; encrypted-media; fullscreen"
              // The OpenBot app needs local storage, cookies, and scripts to initialize React and local database state.
              // eslint-disable-next-line react/iframe-missing-sandbox
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
            {/* Header Banner */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <BotIcon className="size-6" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-ui-lg font-semibold text-foreground">OpenBot Workspace</h2>
                  <p className="text-ui text-muted-foreground leading-normal">
                    Production-ready AI coworkers running on your machine or cloud infrastructure.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant={isConnected ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsConnected((c) => !c)}
                  className="gap-1.5 shrink-0"
                >
                  {isConnected ? (
                    <>
                      <CheckIcon className="size-3.5 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="size-3.5" />
                      <span>Connect Docker</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Connect & Docker Config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gateway URL
                </span>
                <input
                  type="text"
                  value={openBotServerUrl}
                  onChange={(e) => setOpenBotServerUrl(e.target.value)}
                  className="w-full text-ui bg-background/60 border border-border/80 rounded-lg px-3 py-1.5 font-mono outline-none focus:border-primary"
                  placeholder="http://localhost:3001"
                />
                <span className="text-ui-xs text-muted-foreground">
                  Default OpenBot compose endpoint
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stack Status
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-ui font-medium text-foreground">LangGraph Engine</span>
                  <span className="text-ui-xs text-emerald-500 font-mono">v1.2.0</span>
                </div>
                <span className="text-ui-xs text-muted-foreground">
                  Multi-agent state machine ready
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/40 p-4 flex flex-col gap-2">
                <span className="text-ui-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browser Tooling
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-ui font-medium text-foreground">Playwright Sandboxed</span>
                  <span className="text-ui-xs text-primary font-mono">Active</span>
                </div>
                <span className="text-ui-xs text-muted-foreground">
                  Isolated container for web automation
                </span>
              </div>
            </div>

            {/* Coworkers Catalog */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-ui font-semibold text-foreground">Available AI Coworkers</h3>
                <span className="text-ui-xs text-muted-foreground">
                  Select a bot to view capabilities
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEFAULT_COWORKERS.map((coworker) => {
                  const isSelected = activeBot === coworker.id;
                  return (
                    <button
                      key={coworker.id}
                      type="button"
                      onClick={() => setActiveBot(coworker.id)}
                      className={cn(
                        "flex flex-col text-start p-4 rounded-xl border transition-all relative overflow-hidden outline-none",
                        "hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/60 bg-card/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 w-full">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-lg bg-muted/60 border border-border/80 flex items-center justify-center text-foreground shrink-0">
                            <BotIcon className="size-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-ui font-medium truncate text-foreground">
                              {coworker.name}
                            </span>
                            <span className="text-ui-xs text-muted-foreground truncate">
                              {coworker.role}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <CheckIcon className="size-3" />
                          </div>
                        )}
                      </div>

                      <p className="text-ui-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                        {coworker.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {coworker.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="px-2 py-0.5 rounded-md bg-muted/50 text-ui-xs text-muted-foreground border border-border/40 font-mono"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </RouteSurface>
    </RouteInsetSurface>
  );
}
