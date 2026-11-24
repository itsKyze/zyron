// FILE: LocalServerDetailsDialog.tsx
// Purpose: Inspector dialog for a running local server showing URL actions, process metadata, and diagnostics.
// Layer: Environment panel dialog

import type { ServerLocalServerProcess } from "@zyron/contracts";
import { localServerPrimaryLabel } from "@zyron/shared/localServers";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { CheckIcon, CopyIcon, ExternalLinkIcon, RefreshCwIcon, StopFilledIcon } from "~/lib/icons";
import { openExternalLink } from "~/lib/linkChips";
import { useProjectRunStore } from "~/projectRunStore";

function buildLocalServerUrl(server: ServerLocalServerProcess): string | null {
  const primaryPort = server.ports[0];
  if (!primaryPort) return null;
  return `http://localhost:${primaryPort}`;
}

function formatServerAddresses(server: ServerLocalServerProcess): string {
  if (server.addresses.length > 0) {
    return server.addresses.map((entry) => `${entry.host}:${entry.port}`).join(", ");
  }
  return server.ports.map((port) => `localhost:${port}`).join(", ");
}

function formatDiagnosticsSummary(server: ServerLocalServerProcess, url: string | null): string {
  const lines = [
    `Name: ${localServerPrimaryLabel(server)}`,
    `PID: ${server.pid}${server.ppid ? ` (PPID: ${server.ppid})` : ""}`,
    ...(url ? [`URL: ${url}`] : []),
    `Addresses: ${formatServerAddresses(server)}`,
    ...(server.cwd ? [`CWD: ${server.cwd}`] : []),
    `Command: ${server.command}${server.args ? ` ${server.args}` : ""}`,
  ];
  return lines.join("\n");
}

/**
 * Displays runtime details, browser/copy shortcuts, and process diagnostics for a selected local server.
 */
export function LocalServerDetailsDialog({
  server,
  open,
  stopping,
  onOpenChange,
  onStop,
}: {
  server: ServerLocalServerProcess | null;
  open: boolean;
  stopping: boolean;
  onOpenChange: (open: boolean) => void;
  onStop: (server: ServerLocalServerProcess) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<"url" | "diagnostics" | null>(null);
  const runsByProjectId = useProjectRunStore((state) => state.runsByProjectId);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  if (!server) {
    return null;
  }

  const primaryLabel = localServerPrimaryLabel(server);
  const url = buildLocalServerUrl(server);
  const fullCommand = server.args ? `${server.command} ${server.args}` : server.command;
  const matchedRun = Object.values(runsByProjectId).find(
    (run) => run.pid === server.pid || (server.cwd !== undefined && run.cwd === server.cwd),
  );

  const copyText = async (key: "url" | "diagnostics", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span
              className="relative flex size-2.5 shrink-0 items-center justify-center"
              aria-hidden
            >
              <span className="absolute size-2.5 rounded-full bg-success/25" />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            <DialogTitle className="truncate">{primaryLabel}</DialogTitle>
          </div>
          <DialogDescription dir="ltr" className="truncate font-mono text-ui-xs">
            {url ?? formatServerAddresses(server)} · PID {server.pid}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="flex flex-col gap-3">
          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {url ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => openExternalLink(url)}
                className="gap-1.5 text-ui-sm"
              >
                <ExternalLinkIcon className="size-3.5" />
                <span>Open in Browser</span>
              </Button>
            ) : null}

            {url ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void copyText("url", url)}
                className="gap-1.5 text-ui-sm"
              >
                {copiedKey === "url" ? (
                  <CheckIcon className="size-3.5 text-success" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
                <span>{copiedKey === "url" ? "Copied URL" : "Copy URL"}</span>
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyText("diagnostics", formatDiagnosticsSummary(server, url))}
              className="gap-1.5 text-ui-sm"
            >
              {copiedKey === "diagnostics" ? (
                <CheckIcon className="size-3.5 text-success" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
              <span>{copiedKey === "diagnostics" ? "Copied Info" : "Copy Info"}</span>
            </Button>
          </div>

          {/* Process & Network Metadata */}
          <div
            dir="ltr"
            className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/30 p-3 font-mono text-ui-xs"
          >
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
              <span className="text-muted-foreground">Status</span>
              <span className="text-foreground">
                Listening{matchedRun ? ` · ${matchedRun.status}` : ""}
              </span>
            </div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
              <span className="text-muted-foreground">PID</span>
              <span className="text-foreground">
                {server.pid}
                {server.ppid ? ` (parent ${server.ppid})` : ""}
              </span>
            </div>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
              <span className="text-muted-foreground">Addresses</span>
              <span className="break-all text-foreground">{formatServerAddresses(server)}</span>
            </div>
            {server.cwd ? (
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                <span className="text-muted-foreground">Directory</span>
                <span className="break-all text-foreground">{server.cwd}</span>
              </div>
            ) : null}
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
              <span className="text-muted-foreground">Command</span>
              <span className="break-all text-foreground">{fullCommand}</span>
            </div>
            {matchedRun ? (
              <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                <span className="text-muted-foreground">Started</span>
                <span className="text-foreground">{matchedRun.startedAt}</span>
              </div>
            ) : null}
          </div>

          {/* Output / Logs Note */}
          <div className="rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 text-ui-xs text-muted-foreground">
            {matchedRun
              ? "Managed by Zyron project runner. Open the Terminal drawer for live process output."
              : "Discovered via local port scan. Live stdout/stderr streaming is available for processes started inside Zyron's Terminal."}
          </div>
        </DialogPanel>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!server.isStoppable || stopping}
            onClick={() => {
              onStop(server);
              onOpenChange(false);
            }}
            title={
              server.isStoppable
                ? `Stop ${primaryLabel}`
                : (server.stopDisabledReason ?? "Server cannot be stopped from here")
            }
            className="gap-1.5 text-ui-sm"
          >
            {stopping ? (
              <RefreshCwIcon className="size-3.5 animate-spin" />
            ) : (
              <StopFilledIcon className="size-3.5" />
            )}
            <span>{stopping ? "Stopping…" : "Stop Server"}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-ui-sm"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
