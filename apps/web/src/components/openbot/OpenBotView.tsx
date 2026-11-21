// FILE: OpenBotView.tsx
// Purpose: Embeds authentic OpenBot Desktop onboarding and Live Workspace inside Zyron.
// Layer: Web route view component

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RouteInsetSurface } from "../RouteInsetSurface";
import { RouteSurface, RouteSurfaceHeader } from "../RouteSurface";
import { Button } from "~/components/ui/button";
import { ChevronLeftIcon, ExternalLinkIcon, ResetIcon } from "~/lib/icons";
import { openExternalLink } from "~/lib/linkChips";

const OPENBOT_DESKTOP_URL = "http://127.0.0.1:3020";
const OPENBOT_BASE_URL = "http://127.0.0.1:3001";
const OPENBOT_INSTALL_TOKEN = "1b51c90286b2846212078c0f544eb35697b82fc092cf628312b8a6f9f1d9de4a";
const OPENBOT_AUTH_URL = `${OPENBOT_BASE_URL}/api/install/enter?token=${OPENBOT_INSTALL_TOKEN}&to=/`;

export default function OpenBotView() {
  const navigate = useNavigate();

  // Mode: "desktop" embeds the real apps/openbot/desktop onboarding shell;
  // "workspace" embeds the live container workspace on 3001.
  const [viewMode, setViewMode] = useState<"desktop" | "workspace">(() => {
    return typeof window !== "undefined" &&
      localStorage.getItem("zyron-openbot-configured") === "true"
      ? "workspace"
      : "desktop";
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const activeUrl = viewMode === "desktop" ? OPENBOT_DESKTOP_URL : OPENBOT_AUTH_URL;

  const handleModeSwitch = (mode: "desktop" | "workspace") => {
    setViewMode(mode);
    if (mode === "workspace" && typeof window !== "undefined") {
      localStorage.setItem("zyron-openbot-configured", "true");
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <RouteInsetSurface>
      <RouteSurface>
        <RouteSurfaceHeader>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: "/" })}
              className="h-8 gap-1 px-2 text-ui-sm text-muted-foreground hover:text-foreground shrink-0"
              title="Return to chats"
            >
              <ChevronLeftIcon className="size-4" />
              <span>Back</span>
            </Button>
            <div className="h-4 w-px bg-border/60 shrink-0" />
            <span className="text-ui font-medium text-foreground truncate">
              {viewMode === "desktop" ? "OpenBot Desktop Onboarding" : "OpenBot Workspace"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-ui-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{viewMode === "desktop" ? "Desktop Shell" : "Live Workspace"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5">
              <Button
                type="button"
                variant={viewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeSwitch("desktop")}
                className="h-7 px-2.5 text-ui-xs"
                title="Open real OpenBot desktop onboarding shell (/apps/openbot/desktop)"
              >
                Onboarding
              </Button>
              <Button
                type="button"
                variant={viewMode === "workspace" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeSwitch("workspace")}
                className="h-7 px-2.5 text-ui-xs"
                title="Open live OpenBot container workspace on port 3001"
              >
                Workspace
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="size-8 p-0"
              title="Reload view"
            >
              <ResetIcon className="size-3.5 text-muted-foreground" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openExternalLink(activeUrl)}
              className="gap-1.5 h-8 text-ui-sm"
              title="Open interface in native browser tab"
            >
              <span>Browser</span>
              <ExternalLinkIcon className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </RouteSurfaceHeader>

        <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
          <iframe
            key={`${viewMode}-${refreshKey}`}
            src={activeUrl}
            title="OpenBot Application"
            className="w-full h-full border-none bg-background"
            allow="clipboard-read; clipboard-write; microphone; camera; autoplay; encrypted-media; fullscreen"
            // eslint-disable-next-line react/iframe-missing-sandbox
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          />
        </div>
      </RouteSurface>
    </RouteInsetSurface>
  );
}
