// FILE: OpenBotView.tsx
// Purpose: Embeds authentic OpenBot Desktop onboarding and Live Workspace inside Zyron.
// Layer: Web route view component

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { RouteInsetSurface } from "../RouteInsetSurface";
import { RouteSurface, RouteSurfaceHeader } from "../RouteSurface";
import { Button } from "~/components/ui/button";
import { ChevronLeftIcon, ExternalLinkIcon } from "~/lib/icons";
import { openExternalLink } from "~/lib/linkChips";

const OPENBOT_DESKTOP_URL = "http://127.0.0.1:3020";
const OPENBOT_BASE_URL = "http://127.0.0.1:3001";
const OPENBOT_INSTALL_TOKEN = "1b51c90286b2846212078c0f544eb35697b82fc092cf628312b8a6f9f1d9de4a";
const OPENBOT_AUTH_URL = `${OPENBOT_BASE_URL}/api/install/enter?token=${OPENBOT_INSTALL_TOKEN}&to=/`;

export default function OpenBotView() {
  const navigate = useNavigate();

  // If already configured, load workspace server (3001); otherwise load desktop onboarding shell (3020)
  const isConfigured =
    typeof window !== "undefined" && localStorage.getItem("zyron-openbot-configured") === "true";

  const activeUrl = isConfigured ? OPENBOT_AUTH_URL : OPENBOT_DESKTOP_URL;

  return (
    <RouteInsetSurface>
      <RouteSurface>
        <RouteSurfaceHeader navigationControls={false}>
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
            <span className="text-ui font-medium text-foreground truncate">OpenBot Workspace</span>
          </div>

          <div className="flex items-center gap-2">
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
